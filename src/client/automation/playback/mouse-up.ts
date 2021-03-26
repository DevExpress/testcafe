import hammerhead from '../deps/hammerhead';
import VisibleElementAutomation from './visible-element-automation';
import cursor from '../cursor';
import createClickCommand from './click/click-command';
import { MouseDownStateController, MouseUpStateController } from './automation-states';
import { MouseOptions } from '../../../test-run/commands/options';
import testCafeCore from '../deps/testcafe-core';
import { EnsureElementResult, EnsureElementResultArgs } from './interfaces';

const domUtils   = testCafeCore.domUtils;
const arrayUtils = testCafeCore.arrayUtils;


// @ts-ignore
const Promise = hammerhead.Promise;

const extend = hammerhead.utils.extend;
const browserUtils = hammerhead.utils.browser;
const eventSimulator = hammerhead.eventSandbox.eventSimulator;
const listeners = hammerhead.eventSandbox.listeners;

export default class MouseUpAutomation extends VisibleElementAutomation {
    private modifiers: {};
    public upState: MouseUpStateController;
    public downState: MouseDownStateController;
    private mouseDownEnsureVisibilityEventArgs: EnsureElementResultArgs;

    public constructor (element: HTMLElement | null, mouseOptions: MouseOptions, mouseDownState: MouseDownStateController, eventArgs: EnsureElementResultArgs) {
        super(element, mouseOptions);

        this.modifiers = mouseOptions.modifiers;

        this.upState = MouseUpStateController.from({ clickElement: null });
        this.downState = MouseDownStateController.from(mouseDownState);

        this.mouseDownEnsureVisibilityEventArgs = eventArgs;

        this.element = this.mouseDownEnsureVisibilityEventArgs?.element || this.element;

        if (!this.downState.mouseDownElement)
            this.downState.setElements(this.element);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    public run (useStrictElementCheck: boolean): Promise<unknown> {
        let promise = Promise.resolve();

        if (!this.mouseDownEnsureVisibilityEventArgs) {
            promise = this._ensureElement(useStrictElementCheck, false, false)
                .then(({ element, clientPoint, screenPoint, devicePoint }: EnsureElementResult) => {
                    this.mouseDownEnsureVisibilityEventArgs = {
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
            .then(() => this._mouseup(this.mouseDownEnsureVisibilityEventArgs))
            .then(({ timeStamp }: { timeStamp: number }) => {
                this.options.timeStamp = timeStamp;

                return this._click(this.mouseDownEnsureVisibilityEventArgs);
            });
    }

    private static _getElementForClick (mouseDownElement: HTMLElement, topElement: HTMLElement, mouseDownElementParentNodes: Node[]): HTMLElement | null {
        const topElementParentNodes = domUtils.getParents(topElement);
        const areElementsSame       = domUtils.isTheSameNode(topElement, mouseDownElement);

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

    private _mouseup (eventArgs: any): Promise<{ timeStamp: number }> {
        return cursor
            .buttonUp()
            .then(() => this._getElementForEvent(eventArgs))
            .then((element: HTMLElement) => {
                eventArgs.element = element;

                this.upState.clickElement = MouseUpAutomation._getElementForClick(this.downState.mouseDownElement || element, element,
                    this.downState.targetElementParentNodes);

                let timeStamp = {};

                const getTimeStamp = (e: Event): void => {
                    timeStamp = e.timeStamp;

                    listeners.removeInternalEventBeforeListener(window, ['mouseup'], getTimeStamp);
                };

                if (!browserUtils.isIE)
                    listeners.addInternalEventBeforeListener(window, ['mouseup'], getTimeStamp);

                if (!this.downState._isTouchEventWasCancelled())
                    eventSimulator.mouseup(element, eventArgs.options);

                return { timeStamp };
            });
    }

    private _click (eventArgs: unknown): unknown {
        const clickCommand = createClickCommand(this.upState, eventArgs);

        if (!this.downState._isTouchEventWasCancelled())
            clickCommand.run();

        return eventArgs;
    }

    // // NOTE:
    // // If `touchstart`, `touchmove`, or `touchend` are canceled, we should not dispatch any mouse event
    // // that would be a consequential result of the prevented touch event
    // _isTouchEventWasCancelled () {
    //     return this.eventState.touchStartCancelled || this.eventState.touchEndCancelled;
    // }
}

