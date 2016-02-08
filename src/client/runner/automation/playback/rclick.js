import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { fromPoint as getElementFromPoint } from '../get-element';
import * as automationUtil from '../util';
import * as automationSettings from '../settings';
import MoveAutomation from '../playback/move';
import MoveOptions from '../options/move';
import cursor from '../cursor';
import delay from '../../utils/delay';
import nextTick from '../../utils/next-tick';
import * as mouseUtils from '../../utils/mouse';

var extend         = hammerhead.utils.extend;
var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;
var eventUtils    = testCafeCore.eventUtils;


export default class RClickAutomation {
    constructor (element, clickOptions) {
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
            simulateFocus:           true,
            simulateDefaultBehavior: true
        };
    }

    _getMoveArguments () {
        var clickOnElement    = positionUtils.isContainOffset(this.element, this.offsetX, this.offsetY);
        var moveActionOffsets = mouseUtils.getMoveAutomationOffsets(this.element, this.offsetX, this.offsetY);

        return {
            element: clickOnElement ? this.element : document.documentElement,
            offsetX: moveActionOffsets.offsetX,
            offsetY: moveActionOffsets.offsetY
        };
    }

    _calculateEventArguments () {
        var point   = null;
        var options = null;

        if (!this.eventArgs.point) {
            var screenPoint = mouseUtils.getAutomationPoint(this.element, this.offsetX, this.offsetY);

            point = mouseUtils.convertToClient(this.element, screenPoint);

            options = extend({
                clientX: point.x,
                clientY: point.y,
                button:  eventUtils.BUTTON.right,
                which:   eventUtils.WHICH_PARAMETER.rightButton,
                buttons: eventUtils.BUTTONS_PARAMETER.rightButton
            }, this.modifiers);
        }

        var expectedElement = positionUtils.isContainOffset(this.element, this.offsetX, this.offsetY) ?
                              this.element : null;

        var x          = point ? point.x : this.eventArgs.point.x;
        var y          = point ? point.y : this.eventArgs.point.y;
        var topElement = getElementFromPoint(x, y, expectedElement);

        return {
            point:   point || this.eventArgs.point,
            options: options || this.eventArgs.options,
            element: topElement || this.element
        };
    }

    _move ({ element, offsetX, offsetY }) {
        var moveOptions = new MoveOptions();

        moveOptions.offsetX   = offsetX;
        moveOptions.offsetY   = offsetY;
        moveOptions.modifiers = this.modifiers;

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(automationSettings.ACTION_STEP_DELAY));
    }

    _mousedown () {
        return cursor
            .rightButtonDown()
            .then(() => {
                this.eventArgs = this._calculateEventArguments();

                var isBodyElement         = this.eventArgs.element.tagName.toLowerCase() === 'body';
                var isContentEditable     = domUtils.isContentEditableElement(this.eventArgs.element);
                var isContentEditableBody = isBodyElement && isContentEditable;
                var activeElement         = domUtils.getActiveElement();

                // NOTE: in IE, focus is not raised if the element was focused
                // before the click, even if focus is lost during the mousedown
                this.eventState.simulateFocus = !browserUtils.isIE || activeElement !== this.eventArgs.element ||
                                                isContentEditableBody;

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

        return automationUtil
            .focusAndSetSelection(elementForFocus, this.eventState.simulateFocus, this.caretPos)
            .then(() => nextTick());
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => {
                this.eventArgs = this._calculateEventArguments();

                eventSimulator.mouseup(this.eventArgs.element, this.eventArgs.options);

                return delay(automationSettings.ACTION_STEP_DELAY);
            });
    }

    _contextmenu () {
        this.eventArgs = this._calculateEventArguments();

        eventSimulator.contextmenu(this.eventArgs.element, this.eventArgs.options);

        if (!domUtils.isElementFocusable(this.eventArgs.element))
            automationUtil.focusByRelatedElement(this.eventArgs.element);
    }

    run () {
        var moveArguments = this._getMoveArguments();

        return this._move(moveArguments)
            .then(() => this._mousedown())
            .then(() => this._mouseup())
            .then(() => this._contextmenu());
    }
}
