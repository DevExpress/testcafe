import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../get-element';
import { ClickOptions } from '../../../../test-run/commands/options';
import ClickAutomation from '../playback/click';
import * as mouseUtils from '../../utils/mouse';
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
            skipClick: false
        };
    }

    _calculateEventArguments () {
        var point       = null;
        var options     = null;
        var screenPoint = null;

        if (!this.eventArgs.point) {
            screenPoint = mouseUtils.getAutomationPoint(this.element, this.offsetX, this.offsetY);
            point       = mouseUtils.convertToClient(this.element, screenPoint);

            options = extend({
                clientX: point.x,
                clientY: point.y
            }, this.modifiers);
        }

        var expectedElement = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY) ?
                              this.element : null;

        var x          = point ? point.x : this.eventArgs.point.x;
        var y          = point ? point.y : this.eventArgs.point.y;
        var topElement = getElementFromPoint(x, y, expectedElement);

        if (!topElement)
            throw new Error(AUTOMATION_ERROR_TYPES.elementIsInvisibleError);

        return {
            screenPoint: screenPoint || this.eventArgs.screenPoint,
            point:       point || this.eventArgs.point,
            options:     options || this.eventArgs.options,
            element:     topElement
        };
    }

    _firstClick () {
        this.eventArgs = this._calculateEventArguments();

        var clickAutomation = new ClickAutomation(this.element, this.options);

        return clickAutomation
            .run()
            .then(() => delay(FIRST_CLICK_DELAY));
    }

    _secondClick () {
        this.eventArgs = this._calculateEventArguments();

        //NOTE: we should not call focus after the second mousedown (except in IE) because of the native browser behavior
        if (browserUtils.isIE)
            eventUtils.bind(document, 'focus', eventUtils.preventDefault, true);

        var clickOptions = new ClickOptions({
            offsetX:   this.eventArgs.screenPoint.x,
            offsetY:   this.eventArgs.screenPoint.y,
            caretPos:  this.caretPos,
            modifiers: this.modifiers
        });

        var clickAutomation = new ClickAutomation(document.documentElement, clickOptions);

        return clickAutomation
            .run()
            .then(() => {
                this.eventState.skipClick = clickAutomation.eventState.skipClick;
                this.eventArgs            = clickAutomation.eventArgs;

                if (browserUtils.isIE)
                    eventUtils.unbind(document, 'focus', eventUtils.preventDefault, true);
            });
    }

    _dblClick () {
        // NOTE: If an element under the cursor has changed after the second
        // 'mousedown' event, we should not raise the 'dblclick' event
        if (!this.eventState.skipClick)
            eventSimulator.dblclick(this.eventArgs.element, this.eventArgs.options);
    }

    run () {
        return this._firstClick()
            .then(() => this._secondClick())
            .then(() => this._dblClick());
    }
}
