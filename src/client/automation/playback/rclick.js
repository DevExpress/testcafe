import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../get-element';
import { focusAndSetSelection, focusByRelatedElement } from '../utils/utils';
import MoveAutomation from './move';
import { MoveOptions } from '../../../test-run/commands/options';
import cursor from '../cursor';
import nextTick from '../utils/next-tick';
import { getMoveAutomationOffsets } from '../utils/offsets';
import getAutomationPoint from '../utils/get-automation-point';
import screenPointToClient from '../utils/screen-point-to-client';
import AutomationSettings from '../settings';
import AUTOMATION_ERROR_TYPES from '../errors';

var Promise = hammerhead.Promise;

var extend         = hammerhead.utils.extend;
var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;
var eventUtils    = testCafeCore.eventUtils;
var delay         = testCafeCore.delay;


export default class RClickAutomation {
    constructor (element, clickOptions) {
        this.element   = element;
        this.modifiers = clickOptions.modifiers;
        this.caretPos  = clickOptions.caretPos;

        this.offsetX = clickOptions.offsetX;
        this.offsetY = clickOptions.offsetY;
        this.speed   = clickOptions.speed;

        this.automationSettings = new AutomationSettings(this.speed);

        this.eventArgs = {
            point:   null,
            options: null,
            element: null
        };

        this.eventState = { simulateDefaultBehavior: true };

        this.activeElementBeforeMouseDown = null;
    }

    _getMoveArguments () {
        var clickOnElement    = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY);
        var moveActionOffsets = getMoveAutomationOffsets(this.element, this.offsetX, this.offsetY);

        return {
            element: clickOnElement ? this.element : document.documentElement,
            offsetX: moveActionOffsets.offsetX,
            offsetY: moveActionOffsets.offsetY,
            speed:   this.speed
        };
    }

    _calculateEventArguments () {
        var point   = null;
        var options = null;

        if (!this.eventArgs.point) {
            var screenPoint = getAutomationPoint(this.element, this.offsetX, this.offsetY);

            point = screenPointToClient(this.element, screenPoint);

            options = extend({
                clientX: point.x,
                clientY: point.y,
                button:  eventUtils.BUTTON.right,
                which:   eventUtils.WHICH_PARAMETER.rightButton,
                buttons: eventUtils.BUTTONS_PARAMETER.rightButton
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
                    point:   point || this.eventArgs.point,
                    options: options || this.eventArgs.options,
                    element: topElement
                };
            });
    }

    _move ({ element, offsetX, offsetY, speed }) {
        var moveOptions = new MoveOptions({
            offsetX,
            offsetY,
            speed,

            modifiers: this.modifiers
        }, false);

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(this.automationSettings.mouseActionStepDelay));
    }

    _mousedown () {
        return cursor
            .rightButtonDown()
            .then(() => this._calculateEventArguments())
            .then(args => {
                this.eventArgs = args;

                this.activeElementBeforeMouseDown = domUtils.getActiveElement();

                this.eventState.simulateDefaultBehavior = eventSimulator.mousedown(this.eventArgs.element,
                    this.eventArgs.options);
            })
            .then(() => this._focus());
    }

    _focus () {
        if (this.simulateDefaultBehavior === false)
            return nextTick();

        // NOTE: If a target element is a contentEditable element, we need to call focusAndSetSelection directly for
        // this element. Otherwise, if the element obtained by elementFromPoint is a child of the contentEditable
        // element, a selection position may be calculated incorrectly (by using the caretPos option).
        var elementForFocus = domUtils.isContentEditableElement(this.element) ? this.element : this.eventArgs.element;

        // NOTE: IE doesn't perform focus if active element has been changed while executing mousedown
        var simulateFocus = !browserUtils.isIE || this.activeElementBeforeMouseDown === domUtils.getActiveElement();

        return focusAndSetSelection(elementForFocus, simulateFocus, this.caretPos)
            .then(() => nextTick());
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => this._calculateEventArguments())
            .then(args => {
                this.eventArgs = args;

                eventSimulator.mouseup(this.eventArgs.element, this.eventArgs.options);
            });
    }

    _contextmenu () {
        return this._calculateEventArguments()
            .then(args => {
                this.eventArgs = args;

                eventSimulator.contextmenu(this.eventArgs.element, this.eventArgs.options);

                if (!domUtils.isElementFocusable(this.eventArgs.element))
                    focusByRelatedElement(this.eventArgs.element);
            });
    }

    run () {
        var moveArguments = this._getMoveArguments();

        // NOTE: we should raise mouseup event with 'mouseActionStepDelay' after we trigger
        // mousedown event regardless of how long mousedown event handlers were executing
        return this
            ._move(moveArguments)
            .then(() => Promise.all([delay(this.automationSettings.mouseActionStepDelay), this._mousedown()]))
            .then(() => this._mouseup())
            .then(() => this._contextmenu());
    }
}
