import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import VisibleElementAutomation from './visible-element-automation';
import { focusAndSetSelection, focusByRelatedElement } from '../utils/utils';
import cursor from '../cursor';
import nextTick from '../utils/next-tick';

var Promise = hammerhead.Promise;

var extend         = hammerhead.utils.extend;
var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var domUtils   = testCafeCore.domUtils;
var eventUtils = testCafeCore.eventUtils;
var delay      = testCafeCore.delay;


export default class RClickAutomation extends VisibleElementAutomation {
    constructor (element, clickOptions) {
        super(element, clickOptions);

        this.modifiers = clickOptions.modifiers;
        this.caretPos  = clickOptions.caretPos;

        this.eventState = {
            simulateDefaultBehavior:      true,
            activeElementBeforeMouseDown: null
        };
    }

    _mousedown (eventArgs) {
        return cursor
            .rightButtonDown()
            .then(() => {
                this.eventState.activeElementBeforeMouseDown = domUtils.getActiveElement();
                this.eventState.simulateDefaultBehavior      = eventSimulator.mousedown(eventArgs.element, eventArgs.options);
            })
            .then(() => this._focus(eventArgs));
    }

    _focus (eventArgs) {
        if (this.simulateDefaultBehavior === false)
            return nextTick();

        // NOTE: If a target element is a contentEditable element, we need to call focusAndSetSelection directly for
        // this element. Otherwise, if the element obtained by elementFromPoint is a child of the contentEditable
        // element, a selection position may be calculated incorrectly (by using the caretPos option).
        var elementForFocus = domUtils.isContentEditableElement(this.element) ? this.element : eventArgs.element;

        // NOTE: IE doesn't perform focus if active element has been changed while executing mousedown
        var simulateFocus = !browserUtils.isIE || this.eventState.activeElementBeforeMouseDown === domUtils.getActiveElement();

        return focusAndSetSelection(elementForFocus, simulateFocus, this.caretPos)
            .then(() => nextTick());
    }

    _mouseup (eventArgs) {
        return cursor
            .buttonUp()
            .then(() => this._getElementForEvent(eventArgs))
            .then(element => eventSimulator.mouseup(element, eventArgs.options));
    }

    _contextmenu (eventArgs) {
        return this
            ._getElementForEvent(eventArgs)
            .then(element => {
                eventSimulator.contextmenu(element, eventArgs.options);

                if (!domUtils.isElementFocusable(element))
                    focusByRelatedElement(element);
            });
    }

    run (useStrictElementCheck) {
        var eventArgs = null;

        return this
            ._ensureElement(useStrictElementCheck)
            .then(({ element, clientPoint }) => {
                eventArgs = {
                    point:   clientPoint,
                    element: element,
                    options: extend({
                        clientX: clientPoint.x,
                        clientY: clientPoint.y,
                        button:  eventUtils.BUTTON.right,
                        which:   eventUtils.WHICH_PARAMETER.rightButton,
                        buttons: eventUtils.BUTTONS_PARAMETER.rightButton
                    }, this.modifiers)
                };

                // NOTE: we should raise mouseup event with 'mouseActionStepDelay' after we trigger
                // mousedown event regardless of how long mousedown event handlers were executing
                return Promise.all([delay(this.automationSettings.mouseActionStepDelay), this._mousedown(eventArgs)]);
            })
            .then(() => this._mouseup(eventArgs))
            .then(() => this._contextmenu(eventArgs));
    }
}
