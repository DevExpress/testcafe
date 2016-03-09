import hammerhead from '../../../deps/hammerhead';
import testCafeCore from '../../../deps/testcafe-core';
import testCafeUI from '../../../deps/testcafe-ui';
import { fromPoint as getElementFromPoint } from '../../get-element';
import { focusAndSetSelection, focusByRelatedElement } from '../../utils';
import * as automationSettings from '../../settings';
import MoveAutomation from '../move';
import MoveOptions from '../../options/move';
import SelectChildClickAutomation from './select-child';
import cursor from '../../cursor';
import delay from '../../../utils/delay';
import nextTick from '../../../utils/next-tick';
import * as mouseUtils from '../../../utils/mouse';

var Promise = hammerhead.Promise;

var extend         = hammerhead.utils.extend;
var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;
var styleUtils    = testCafeCore.styleUtils;
var eventUtils    = testCafeCore.eventUtils;

var selectElementUI = testCafeUI.selectElement;


export default class ClickAutomation {
    constructor (element, clickOptions) {
        this.options   = clickOptions;
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
            mousedownPrevented:      false,
            blurRaised:              false,
            simulateDefaultBehavior: true,
            skipClick:               false
        };
    }

    _getMoveArguments () {
        var clickOnElement    = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY);
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
                clientY: point.y
            }, this.modifiers);
        }

        var expectedElement = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY) ?
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

    _bindMousedownHandler () {
        var onmousedown = e => {
            this.eventState.mousedownPrevented = e.defaultPrevented;
            eventUtils.preventDefault(e);
            eventUtils.unbind(this.element, 'mousedown', onmousedown);
        };

        eventUtils.bind(this.element, 'mousedown', onmousedown);
    }

    _bindBlurHandler (element) {
        var onblur = () => {
            this.eventState.blurRaised = true;
            eventUtils.unbind(element, 'blur', onblur, true);
        };

        eventUtils.bind(element, 'blur', onblur, true);
    }

    _raiseTouchEvents () {
        if (browserUtils.hasTouchEvents) {
            eventSimulator.touchstart(this.eventArgs.element, this.eventArgs.options);
            eventSimulator.touchend(this.eventArgs.element, this.eventArgs.options);
        }
    }

    _mousedown () {
        this.eventArgs = this._calculateEventArguments();

        this._raiseTouchEvents();

        return cursor
            .leftButtonDown()
            .then(() => {
                var isBodyElement         = this.eventArgs.element.tagName.toLowerCase() === 'body';
                var isContentEditable     = domUtils.isContentEditableElement(this.eventArgs.element);
                var isContentEditableBody = isBodyElement && isContentEditable;
                var activeElement         = domUtils.getActiveElement();

                // NOTE: in IE focus is not raised if element was focused
                // before click, even if focus is lost during mousedown
                this.eventState.simulateFocus = !browserUtils.isIE || activeElement !== this.eventArgs.element ||
                                                isContentEditableBody;

                // NOTE: In WebKit and IE, the mousedown event opens the select element's dropdown;
                // therefore, we should prevent mousedown and hide the dropdown (B236416).
                var needCloseSelectDropDown = (browserUtils.isWebKit || browserUtils.isIE) &&
                                              domUtils.isSelectElement(this.element);

                if (needCloseSelectDropDown)
                    this._bindMousedownHandler();

                this._bindBlurHandler(activeElement);

                this.eventState.simulateDefaultBehavior =
                    eventSimulator.mousedown(this.eventArgs.element, this.eventArgs.options);

                if (this.eventState.simulateDefaultBehavior === false) {
                    this.eventState.simulateDefaultBehavior = needCloseSelectDropDown &&
                                                              !this.eventState.mousedownPrevented;
                }

                return this._ensureActiveElementBlur(activeElement);
            })
            .then(() => this._focus())
            .then(() => delay(automationSettings.ACTION_STEP_DELAY));
    }

    _ensureActiveElementBlur (element) {
        // NOTE: In some cases, mousedown may lead to active element change (browsers raise blur).
        // We simulate the blur event if the active element was changed after the mousedown, and
        // the blur event does not get raised automatically (B239273, B253520)
        return new Promise(resolve => {
            var simulateBlur = domUtils.getActiveElement() !== element && !this.eventState.blurRaised;

            if (!simulateBlur) {
                resolve();
                return;
            }

            if (browserUtils.isIE && browserUtils.version < 12) {
                // NOTE: In whatever way an element is blurred from the client script, the
                // blur event is raised asynchronously in IE (in MSEdge focus/blur is sync)
                nextTick()
                    .then(() => {
                        if (!this.eventState.blurRaised)
                            eventSimulator.blur(element);

                        resolve();
                    });
            }
            else {
                eventSimulator.blur(element);
                resolve();
            }
        });
    }

    _focus () {
        if (this.eventState.simulateDefaultBehavior === false)
            return Promise.resolve();

        // NOTE: If a target element is a contentEditable element, we need to call focusAndSetSelection directly for
        // this element. Otherwise, if the element obtained by elementFromPoint is a child of the contentEditable
        // element, a selection position may be calculated incorrectly (by using the caretPos option).
        var elementForFocus = domUtils.isContentEditableElement(this.element) ?
                              this.element : this.eventArgs.element;

        return focusAndSetSelection(elementForFocus, this.eventState.simulateFocus, this.caretPos);
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => {
                var prevElementForEvent = this.eventArgs.element;

                this.eventArgs            = this._calculateEventArguments();
                this.eventState.skipClick = prevElementForEvent !== this.eventArgs.element;

                eventSimulator.mouseup(this.eventArgs.element, this.eventArgs.options);

                return delay(automationSettings.ACTION_STEP_DELAY);
            });
    }

    _click () {
        if (this.eventArgs.element.tagName.toLowerCase() === 'option')
            return;

        // NOTE: If the element under the cursor has changed after the
        // 'mousedown' event, we should not raise the 'click' event
        if (!this.eventState.skipClick)
            eventSimulator.click(this.eventArgs.element, this.eventArgs.options);

        if (!domUtils.isElementFocusable(this.eventArgs.element))
            focusByRelatedElement(this.eventArgs.element);

        // NOTE: Emulating the click event on the 'select' element doesn't expand the
        // dropdown with options (except chrome), therefore we should emulate it.
        var isSelectElement      = domUtils.isSelectElement(this.eventArgs.element);
        var isSelectWithDropDown = isSelectElement && styleUtils.getSelectElementSize(this.eventArgs.element) === 1;

        if (isSelectWithDropDown && this.eventState.simulateDefaultBehavior !== false) {
            if (selectElementUI.isOptionListExpanded(this.eventArgs.element))
                selectElementUI.collapseOptionList();
            else
                selectElementUI.expandOptionList(this.eventArgs.element);
        }
    }

    run () {
        if (/option|optgroup/.test(this.element.tagName.toLowerCase())) {
            var selectChildClickAutomation = new SelectChildClickAutomation(this.element, this.options);

            return selectChildClickAutomation.run();
        }

        var moveArguments = this._getMoveArguments();

        return this._move(moveArguments)
            .then(() => this._mousedown())
            .then(() => this._mouseup())
            .then(() => this._click());
    }
}
