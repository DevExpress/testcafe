import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import testCafeUI from '../../deps/testcafe-ui';
import { fromPoint as getElementFromPoint } from '../../get-element';
import { focusAndSetSelection, focusByRelatedElement } from '../../utils/utils';
import MoveAutomation from '../move';
import { MoveOptions } from '../../../../test-run/commands/options';
import SelectChildClickAutomation from './select-child';
import cursor from '../../cursor';
import nextTick from '../../utils/next-tick';
import { getMoveAutomationOffsets } from '../../utils/offsets';
import getAutomationPoint from '../../utils/get-automation-point';
import screenPointToClient from '../../utils/screen-point-to-client';
import { ACTION_STEP_DELAY } from '../../settings';
import AUTOMATION_ERROR_TYPES from '../../errors';

var Promise = hammerhead.Promise;

var extend         = hammerhead.utils.extend;
var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var domUtils      = testCafeCore.domUtils;
var positionUtils = testCafeCore.positionUtils;
var styleUtils    = testCafeCore.styleUtils;
var eventUtils    = testCafeCore.eventUtils;
var arrayUtils    = testCafeCore.arrayUtils;
var delay         = testCafeCore.delay;

var selectElementUI = testCafeUI.selectElement;


export default class ClickAutomation {
    constructor (element, clickOptions) {
        this.options   = clickOptions;
        this.element   = element;
        this.modifiers = clickOptions.modifiers;
        this.caretPos  = clickOptions.caretPos;

        this.offsetX = clickOptions.offsetX;
        this.offsetY = clickOptions.offsetY;

        this.targetElementParentNodes     = [];
        this.activeElementBeforeMouseDown = null;
        this.mouseDownElement             = null;

        this.eventArgs = {
            point:   null,
            options: null,
            element: null
        };

        this.eventState = {
            mousedownPrevented:      false,
            blurRaised:              false,
            simulateDefaultBehavior: true,
            clickElement:            null
        };
    }

    _getMoveArguments () {
        var clickOnElement    = positionUtils.containsOffset(this.element, this.offsetX, this.offsetY);
        var moveActionOffsets = getMoveAutomationOffsets(this.element, this.offsetX, this.offsetY);

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
            var screenPoint = getAutomationPoint(this.element, this.offsetX, this.offsetY);

            point = screenPointToClient(this.element, screenPoint);

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
            point:   point || this.eventArgs.point,
            options: options || this.eventArgs.options,
            element: topElement
        };
    }

    _move ({ element, offsetX, offsetY }) {
        var moveOptions = new MoveOptions({
            offsetX,
            offsetY,

            modifiers: this.modifiers
        }, false);

        var moveAutomation = new MoveAutomation(element, moveOptions);

        return moveAutomation
            .run()
            .then(() => delay(ACTION_STEP_DELAY));
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
        this.eventArgs                = this._calculateEventArguments();
        this.targetElementParentNodes = domUtils.getParents(this.eventArgs.element);
        this.mouseDownElement         = this.eventArgs.element;

        return cursor.leftButtonDown()
            .then(() => {
                this._raiseTouchEvents();

                var activeElement = domUtils.getActiveElement();

                this.activeElementBeforeMouseDown = activeElement;

                // NOTE: In WebKit and IE, the mousedown event opens the select element's dropdown;
                // therefore, we should prevent mousedown and hide the dropdown (B236416).
                var needCloseSelectDropDown = (browserUtils.isWebKit || browserUtils.isIE) &&
                                              domUtils.isSelectElement(this.element);

                if (needCloseSelectDropDown)
                    this._bindMousedownHandler();

                this._bindBlurHandler(activeElement);

                this.eventState.simulateDefaultBehavior =
                    eventSimulator.mousedown(this.eventArgs.element, this.eventArgs.options);

                if (this.eventState.simulateDefaultBehavior === false)
                    this.eventState.simulateDefaultBehavior = needCloseSelectDropDown && !this.eventState.mousedownPrevented;

                return this._ensureActiveElementBlur(activeElement);
            })
            .then(() => this._focus());
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

        // NOTE: IE doesn't perform focus if active element has been changed while executing mousedown
        var simulateFocus = !browserUtils.isIE || this.activeElementBeforeMouseDown === domUtils.getActiveElement();

        return focusAndSetSelection(elementForFocus, simulateFocus, this.caretPos);
    }

    static _getElementForClick (mouseDownElement, topElement, mouseDownElementParentNodes) {
        var topElementParentNodes = domUtils.getParents(topElement);
        var areElementsSame       = domUtils.isTheSameNode(topElement, mouseDownElement);

        // NOTE: Mozilla Firefox always skips click, if an element under cursor has been changed after mousedown.
        if (browserUtils.isFirefox)
            return areElementsSame ? mouseDownElement : null;

        if (!areElementsSame) {
            if (mouseDownElement.contains(topElement) && !domUtils.isEditableFormElement(topElement))
                return mouseDownElement;

            if (topElement.contains(mouseDownElement))
                return topElement;

            // NOTE: If elements are not in the parent-child relationships,
            // non-ff browsers raise the `click` event for their common parent.
            return arrayUtils.getCommonElement(topElementParentNodes, mouseDownElementParentNodes);
        }

        // NOTE: In case the target element and the top element are the same,
        // non-FF browsers are dispatching the `click` event if the target
        // element hasn't changed its position in the DOM after mousedown.
        return arrayUtils.equals(mouseDownElementParentNodes, topElementParentNodes) ? mouseDownElement : null;
    }

    _mouseup () {
        return cursor
            .buttonUp()
            .then(() => {
                this.eventArgs = this._calculateEventArguments();

                this.eventState.clickElement = ClickAutomation._getElementForClick(this.mouseDownElement, this.eventArgs.element,
                    this.targetElementParentNodes);

                eventSimulator.mouseup(this.eventArgs.element, this.eventArgs.options);
            });
    }

    _click () {
        if (domUtils.isOptionElement(this.eventArgs.element))
            return;

        if (this.eventState.clickElement)
            eventSimulator.click(this.eventState.clickElement, this.eventArgs.options);

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
        if (/option|optgroup/.test(domUtils.getTagName(this.element))) {
            var selectChildClickAutomation = new SelectChildClickAutomation(this.element, this.options);

            return selectChildClickAutomation.run();
        }

        var moveArguments = this._getMoveArguments();

        // NOTE: we should raise mouseup event with ACTION_STEP_DELAY after we trigger
        // mousedown event regardless of how long mousedown event handlers were executing
        return this._move(moveArguments)
            .then(() => Promise.all([delay(ACTION_STEP_DELAY), this._mousedown()]))
            .then(() => this._mouseup())
            .then(() => this._click());
    }
}
