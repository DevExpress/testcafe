import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';
import { focusAndSetSelection } from '../../utils/utils';
import nextTick from '../../../core/utils/next-tick';
import createClickCommand from './click-command';

import { MouseEventArgs } from '../../visible-element-automation';
import { MouseClickEventState } from './index';

// @ts-ignore
const Promise = hammerhead.Promise;

const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const listeners        = hammerhead.eventSandbox.listeners;

const domUtils   = testCafeCore.domUtils;
const eventUtils = testCafeCore.eventUtils;
const arrayUtils = testCafeCore.arrayUtils;

function _getElementForClick<E> (mouseDownElement: E, topElement: E, mouseDownElementParentNodes: E[]): E | null {
    const topElementParentNodes = domUtils.getParents(topElement);
    const areElementsSame       = domUtils.isTheSameNode(topElement, mouseDownElement);

    // NOTE: Mozilla Firefox always skips click, if an element under cursor has been changed after mousedown.
    if (browserUtils.isFirefox)
        return areElementsSame ? mouseDownElement : null;

    if (!areElementsSame) {
        // @ts-ignore
        if (mouseDownElement.contains(topElement) && !domUtils.isEditableFormElement(topElement))
            return mouseDownElement;

        // @ts-ignore
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

export class MouseClickStrategy {
    public targetElementParentNodes: Element[];
    public activeElementBeforeMouseDown: Element | null;
    public element: Element;
    public caretPos: number;
    public mouseDownElement: Element | null;
    public eventState: MouseClickEventState;

    public constructor (element: Element, caretPos: number) {
        this.element                      = element;
        this.caretPos                     = caretPos;
        this.targetElementParentNodes     = [];
        this.activeElementBeforeMouseDown = null;
        this.mouseDownElement             = null;

        this.eventState = {
            mousedownPrevented:      false,
            blurRaised:              false,
            simulateDefaultBehavior: true,
            clickElement:            null,
            touchStartCancelled:     false,
            touchEndCancelled:       false,
        };
    }

    public mousedown (eventArgs: MouseEventArgs): Promise<void> {
        this.targetElementParentNodes = domUtils.getParents(eventArgs.element);
        this.mouseDownElement = eventArgs.element;

        this._raiseTouchEvents(eventArgs);

        const activeElement = domUtils.getActiveElement();

        this.activeElementBeforeMouseDown = activeElement;

        // NOTE: In WebKit and IE, the mousedown event opens the select element's dropdown;
        // therefore, we should prevent mousedown and hide the dropdown (B236416).
        const needCloseSelectDropDown = (browserUtils.isWebKit || browserUtils.isIE) &&
            domUtils.isSelectElement(this.mouseDownElement);

        if (needCloseSelectDropDown)
            this._bindMousedownHandler();

        this._bindBlurHandler(activeElement);

        if (!this._isTouchEventWasCancelled())
            this.eventState.simulateDefaultBehavior = eventSimulator.mousedown(eventArgs.element, eventArgs.options);

        if (this.eventState.simulateDefaultBehavior === false)
            this.eventState.simulateDefaultBehavior = needCloseSelectDropDown && !this.eventState.mousedownPrevented;

        return this._ensureActiveElementBlur(activeElement)
            .then(() => this._focus(eventArgs));
    }

    public mouseup (element: HTMLElement, eventArgs: MouseEventArgs): Promise<MouseEventArgs> {
        eventArgs.element = element;

        this.eventState.clickElement = _getElementForClick(this.mouseDownElement, element, this.targetElementParentNodes);

        let timeStamp = {};

        const getTimeStamp = (e: Event): void => {
            timeStamp = e.timeStamp;

            listeners.removeInternalEventBeforeListener(window, ['mouseup'], getTimeStamp);
        };

        if (!browserUtils.isIE)
            listeners.addInternalEventBeforeListener(window, ['mouseup'], getTimeStamp);

        if (!this._isTouchEventWasCancelled())
            eventSimulator.mouseup(element, eventArgs.options);

        if (eventArgs.options)
            eventArgs.options.timeStamp = timeStamp;

        return this._click(eventArgs);
    }

    public async _click (eventArgs: MouseEventArgs): hammerhead.Promise<MouseEventArgs> {
        const clickCommand = createClickCommand(this.eventState, eventArgs);

        if (!this._isTouchEventWasCancelled())
            clickCommand.run();

        return eventArgs;
    }

    // NOTE:
    // If `touchstart`, `touchmove`, or `touchend` are canceled, we should not dispatch any mouse event
    // that would be a consequential result of the prevented touch event
    private _isTouchEventWasCancelled (): boolean {
        return this.eventState.touchStartCancelled || this.eventState.touchEndCancelled;
    }

    private _bindMousedownHandler (): void {
        const onmousedown = (e: Event): void => {
            this.eventState.mousedownPrevented = e.defaultPrevented;
            eventUtils.preventDefault(e);
            eventUtils.unbind(this.element, 'mousedown', onmousedown);
        };

        eventUtils.bind(this.element, 'mousedown', onmousedown);
    }

    private _bindBlurHandler (element: Element): void {
        const onblur = (): void => {
            this.eventState.blurRaised = true;
            eventUtils.unbind(element, 'blur', onblur, true);
        };

        eventUtils.bind(element, 'blur', onblur, true);
    }

    private _ensureActiveElementBlur (element: Element): Promise<void> {
        // NOTE: In some cases, mousedown may lead to active element change (browsers raise blur).
        // We simulate the blur event if the active element was changed after the mousedown, and
        // the blur event does not get raised automatically (B239273, B253520)
        return new Promise((resolve: any) => {
            const simulateBlur = domUtils.getActiveElement() !== element && !this.eventState.blurRaised;

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

    private _focus (eventArgs: MouseEventArgs): Promise<void> {
        if (this.eventState.simulateDefaultBehavior === false)
            return Promise.resolve();

        // NOTE: If a target element is a contentEditable element, we need to call focusAndSetSelection directly for
        // this element. Otherwise, if the element obtained by elementFromPoint is a child of the contentEditable
        // element, a selection position may be calculated incorrectly (by using the caretPos option).
        const elementForFocus = domUtils.isContentEditableElement(this.element) ? this.element : eventArgs.element;

        // NOTE: IE doesn't perform focus if active element has been changed while executing mousedown
        const simulateFocus = !browserUtils.isIE || this.activeElementBeforeMouseDown === domUtils.getActiveElement();

        return focusAndSetSelection(elementForFocus, simulateFocus, this.caretPos);
    }

    private _raiseTouchEvents (eventArgs: MouseEventArgs): void {
        if (featureDetection.isTouchDevice) {
            this.eventState.touchStartCancelled = !eventSimulator.touchstart(eventArgs.element, eventArgs.options);
            this.eventState.touchEndCancelled   = !eventSimulator.touchend(eventArgs.element, eventArgs.options);
        }
    }
}

export function createMouseClickStrategy (element: Element, caretPos: number): MouseClickStrategy {
    return new MouseClickStrategy(element, caretPos);
}
