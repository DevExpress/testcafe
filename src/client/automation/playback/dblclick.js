import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../get-element';
import { ClickOptions } from '../../../test-run/commands/options';
import ClickAutomation from './click';
import getAutomationPoint from '../utils/get-automation-point';
import screenPointToClient from '../utils/screen-point-to-client';
import AUTOMATION_ERROR_TYPES from '../errors';

var extend         = hammerhead.utils.extend;
var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var positionUtils = testCafeCore.positionUtils;
var eventUtils    = testCafeCore.eventUtils;
var delay         = testCafeCore.delay;

const FIRST_CLICK_DELAY = browserUtils.hasTouchEvents ? 0 : 160;


export default class DblClickAutomation {
    constructor (element, clickOptions) {
        this.options = clickOptions;

        this.element   = element;
        this.modifiers = clickOptions.modifiers;
        this.caretPos  = clickOptions.caretPos;

        this.offsetX = clickOptions.offsetX;
        this.offsetY = clickOptions.offsetY;

        this.eventArgs = {
            point:   null,
            options: null,
            element: null
        };

        this.eventState = {
            dblClickElement: null
        };
    }

    _calculateEventArguments () {
        var point       = null;
        var options     = null;
        var screenPoint = null;

        if (!this.eventArgs.point) {
            screenPoint = getAutomationPoint(this.element, this.offsetX, this.offsetY);
            point       = screenPointToClient(this.element, screenPoint);

            options = extend({
                clientX: point.x,
                clientY: point.y
            }, this.modifiers);
        }

        var expectedElement = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY) ?
                              this.element : null;

        var x = point ? point.x : this.eventArgs.point.x;
        var y = point ? point.y : this.eventArgs.point.y;

        return getElementFromPoint(x, y, expectedElement)
            .then(topElement => {
                if (!topElement)
                    throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

                return {
                    screenPoint: screenPoint || this.eventArgs.screenPoint,
                    point:       point || this.eventArgs.point,
                    options:     options || this.eventArgs.options,
                    element:     topElement
                };
            });
    }

    _firstClick () {
        return this._calculateEventArguments()
            .then(args => {
                this.eventArgs = args;

                var clickAutomation = new ClickAutomation(this.element, this.options);

                return clickAutomation.run();
            })
            .then(() => delay(FIRST_CLICK_DELAY));
    }

    _secondClick () {
        var clickAutomation = null;

        return this._calculateEventArguments()
            .then(args => {
                this.eventArgs = args;

                //NOTE: we should not call focus after the second mousedown (except in IE) because of the native browser behavior
                if (browserUtils.isIE)
                    eventUtils.bind(document, 'focus', eventUtils.preventDefault, true);

                var clickOptions = new ClickOptions({
                    offsetX:   this.eventArgs.screenPoint.x,
                    offsetY:   this.eventArgs.screenPoint.y,
                    caretPos:  this.caretPos,
                    modifiers: this.modifiers
                });

                clickAutomation = new ClickAutomation(document.documentElement, clickOptions);

                return clickAutomation.run();
            })
            .then(() => {
                // NOTE: We should raise the `dblclick` event on an element that
                // has been actually clicked during the second click automation.
                this.eventState.dblClickElement = clickAutomation.eventState.clickElement;
                this.eventArgs                  = clickAutomation.eventArgs;

                if (browserUtils.isIE)
                    eventUtils.unbind(document, 'focus', eventUtils.preventDefault, true);
            });
    }

    _dblClick () {
        if (this.eventState.dblClickElement)
            eventSimulator.dblclick(this.eventState.dblClickElement, this.eventArgs.options);
    }

    run () {
        return this._firstClick()
            .then(() => this._secondClick())
            .then(() => this._dblClick());
    }
}
