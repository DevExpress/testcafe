import hammerhead from '../deps/hammerhead';
import cursor from '../cursor';
import createClickCommand from './click/click-command';
import { MouseDownStateController, MouseUpStateController } from './automation-states';
import { MouseOptions } from '../../../test-run/commands/options';
import testCafeCore from '../deps/testcafe-core';
import { EnsureElementResultArgs } from './interfaces';
import MouseBaseAutomation from './mouse-base';

const domUtils   = testCafeCore.domUtils;
const arrayUtils = testCafeCore.arrayUtils;


// @ts-ignore
const Promise = hammerhead.Promise;

const browserUtils = hammerhead.utils.browser;
const eventSimulator = hammerhead.eventSandbox.eventSimulator;
const listeners = hammerhead.eventSandbox.listeners;

export default class MouseUpAutomation extends MouseBaseAutomation {
    public eventState: MouseUpStateController;
    protected downState: MouseDownStateController;

    public constructor (element: HTMLElement, mouseOptions: MouseOptions, mouseDownState?: MouseDownStateController, eventArgs?: EnsureElementResultArgs) {
        super(element, mouseOptions, eventArgs);

        this.eventState = MouseUpStateController.from({ clickElement: null });
        this.downState = MouseDownStateController.from(mouseDownState);

        if (!this.downState.mouseDownElement)
            this.downState.setElements(this.element);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
    public run (useStrictElementCheck: boolean): Promise<unknown> {
        return super.run(useStrictElementCheck)
            .then(() => this._mouseup())
            .then(({ timeStamp }: { timeStamp: number }) => {
                this.options.timeStamp = timeStamp;

                return this._click();
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

    private _mouseup (): Promise<{ timeStamp: number }> {
        return cursor
            .buttonUp()
            .then(() => this._getElementForEvent(null))
            .then((element: HTMLElement) => {
                if (this.ensureElementResultArgs)
                    this.ensureElementResultArgs.element = element;

                this.eventState.clickElement = MouseUpAutomation._getElementForClick(this.downState.mouseDownElement || element, element,
                    this.downState.targetElementParentNodes);

                let timeStamp = {};

                const getTimeStamp = (e: Event): void => {
                    timeStamp = e.timeStamp;

                    listeners.removeInternalEventBeforeListener(window, ['mouseup'], getTimeStamp);
                };

                if (!browserUtils.isIE)
                    listeners.addInternalEventBeforeListener(window, ['mouseup'], getTimeStamp);

                if (!this.downState._isTouchEventWasCancelled())
                    eventSimulator.mouseup(element, this.ensureElementResultArgs?.options);

                return { timeStamp };
            });
    }

    private _click (): EnsureElementResultArgs | undefined {
        const clickCommand = createClickCommand(this.eventState, this.ensureElementResultArgs);

        if (!this.downState._isTouchEventWasCancelled())
            clickCommand.run();

        return this.ensureElementResultArgs;
    }

    // // NOTE:
    // // If `touchstart`, `touchmove`, or `touchend` are canceled, we should not dispatch any mouse event
    // // that would be a consequential result of the prevented touch event
    // _isTouchEventWasCancelled () {
    //     return this.eventState.touchStartCancelled || this.eventState.touchEndCancelled;
    // }
}

