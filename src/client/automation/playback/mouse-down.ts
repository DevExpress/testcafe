import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import VisibleElementAutomation from './visible-element-automation';
import { focusAndSetSelection } from '../utils/utils';
import cursor from '../cursor';
import nextTick from '../utils/next-tick';
import { MouseDownStateController } from './automation-states';
import { ClickOptions } from '../../../test-run/commands/options';
import { EnsureElementResultArgs } from './interfaces';

// @ts-ignore
const Promise = hammerhead.Promise;

const extend           = hammerhead.utils.extend;
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;

const domUtils   = testCafeCore.domUtils;
const eventUtils = testCafeCore.eventUtils;

export default class MouseDownAutomation extends VisibleElementAutomation {
    public modifiers: unknown;
    public caretPos: number;
    public activeElementBeforeMouseDown: HTMLElement | null;
    public eventArgs: EnsureElementResultArgs;
    public eventState: MouseDownStateController;

    public constructor (element: HTMLElement, clickOptions: ClickOptions, eventArgs: EnsureElementResultArgs) {
        super(element, clickOptions);

        this.modifiers = clickOptions.modifiers;
        this.caretPos  = clickOptions.caretPos;

        this.activeElementBeforeMouseDown = null;
        this.eventArgs                    = eventArgs;

        this.eventState = MouseDownStateController.from();
    }

    public run (useStrictElementCheck: boolean): Promise<unknown> {
        let promise = Promise.resolve();

        if (!this.eventArgs) {
            promise = this._ensureElement(useStrictElementCheck, false, false)
                .then(({ element, clientPoint, screenPoint, devicePoint }: any) => {
                    this.eventArgs = {
                        point:       clientPoint,
                        screenPoint: screenPoint,
                        element:     element,
                        options:     extend({
                            clientX: clientPoint.x,
                            clientY: clientPoint.y,
                            screenX: devicePoint.x,
                            screenY: devicePoint.y
                        }, this.modifiers)
                    };
                });
        }

        return promise
            .then(() => this._mousedown(this.eventArgs));
    }

    public _bindMousedownHandler (): void {
        const onmousedown = (e: Event): void => {
            this.eventState.mousedownPrevented = e.defaultPrevented;
            eventUtils.preventDefault(e);
            eventUtils.unbind(this.element, 'mousedown', onmousedown);
        };

        eventUtils.bind(this.element, 'mousedown', onmousedown);
    }

    private _bindBlurHandler (element: HTMLElement): void {
        const onblur = (): void => {
            this.eventState.blurRaised = true;
            eventUtils.unbind(element, 'blur', onblur, true);
        };

        eventUtils.bind(element, 'blur', onblur, true);
    }

    // // NOTE:
    // // If `touchstart`, `touchmove`, or `touchend` are canceled, we should not dispatch any mouse event
    // // that would be a consequential result of the prevented touch event
    // _isTouchEventWasCancelled () {
    //     return this.eventState.touchStartCancelled || this.eventState.touchEndCancelled;
    // }

    private _raiseTouchEvents (eventArgs: EnsureElementResultArgs): void {
        if (featureDetection.isTouchDevice) {
            this.eventState.touchStartCancelled = !eventSimulator.touchstart(eventArgs.element, eventArgs.options);
            this.eventState.touchEndCancelled   = !eventSimulator.touchend(eventArgs.element, eventArgs.options);
        }
    }

    private _mousedown (eventArgs: EnsureElementResultArgs): Promise<unknown> {
        // this.eventState.targetElementParentNodes = domUtils.getParents(eventArgs.element);
        // this.eventState.mouseDownElement         = eventArgs.element;

        this.eventState.setElements(eventArgs.element);

        return cursor.leftButtonDown()
            .then(() => {
                this._raiseTouchEvents(eventArgs);


                const activeElement = domUtils.getActiveElement();

                this.activeElementBeforeMouseDown = activeElement;

                // NOTE: In WebKit and IE, the mousedown event opens the select element's dropdown;
                // therefore, we should prevent mousedown and hide the dropdown (B236416).
                const needCloseSelectDropDown = (browserUtils.isWebKit || browserUtils.isIE) &&
                                                domUtils.isSelectElement(this.eventState.mouseDownElement);

                if (needCloseSelectDropDown)
                    this._bindMousedownHandler();

                this._bindBlurHandler(activeElement);

                if (!this.eventState._isTouchEventWasCancelled())
                    this.eventState.simulateDefaultBehavior = eventSimulator.mousedown(eventArgs.element, eventArgs.options);

                if (this.eventState.simulateDefaultBehavior === false)
                    this.eventState.simulateDefaultBehavior = needCloseSelectDropDown && !this.eventState.mousedownPrevented;

                return this._ensureActiveElementBlur(activeElement);
            })
            .then(() => this._focus(eventArgs));
    }

    private _ensureActiveElementBlur (element: HTMLElement): Promise<void> {
        // NOTE: In some cases, mousedown may lead to active element change (browsers raise blur).
        // We simulate the blur event if the active element was changed after the mousedown, and
        // the blur event does not get raised automatically (B239273, B253520)
        return new Promise((resolve: Function) => {
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

    private _focus (eventArgs: EnsureElementResultArgs): Promise<void> {
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
}

