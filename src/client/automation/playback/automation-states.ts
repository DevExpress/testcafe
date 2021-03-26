import testCafeCore from '../deps/testcafe-core';

const domUtils = testCafeCore.domUtils;

interface DownState {
    mousedownPrevented: boolean;
    blurRaised: boolean;
    simulateDefaultBehavior: boolean;
    touchStartCancelled: boolean;
    touchEndCancelled: boolean;
    targetElementParentNodes: Node[];
    mouseDownElement: HTMLElement | null;
}

interface UpState {
    clickElement: HTMLElement | null;
}

export class MouseDownStateController implements DownState {
    public mousedownPrevented: boolean;
    public blurRaised: boolean;
    public simulateDefaultBehavior: boolean;
    public touchStartCancelled: boolean;
    public touchEndCancelled: boolean;
    public targetElementParentNodes: Node[];
    public mouseDownElement: HTMLElement | null;

    protected constructor (state: DownState) {
        this.mousedownPrevented       = state.mousedownPrevented;
        this.blurRaised               = state.blurRaised;
        this.simulateDefaultBehavior  = state.simulateDefaultBehavior;
        this.touchStartCancelled      = state.touchStartCancelled;
        this.touchEndCancelled        = state.touchEndCancelled;
        this.targetElementParentNodes = state.targetElementParentNodes;
        this.mouseDownElement         = state.mouseDownElement;
    }

    // NOTE:
    // If `touchstart`, `touchmove`, or `touchend` are canceled, we should not dispatch any mouse event
    // that would be a consequential result of the prevented touch event
    public _isTouchEventWasCancelled (): boolean {
        return this.touchStartCancelled || this.touchEndCancelled;
    }

    public setElements (element: HTMLElement): void {
        this.targetElementParentNodes = domUtils.getParents(element);
        this.mouseDownElement         = element;
    }

    public static from (state?: DownState): MouseDownStateController {
        if (state)
            return new MouseDownStateController(state);

        return new MouseDownStateController({
            mousedownPrevented:       false,
            blurRaised:               false,
            simulateDefaultBehavior:  true,
            touchStartCancelled:      false,
            touchEndCancelled:        false,
            targetElementParentNodes: [],
            mouseDownElement:         null
        });
    }
}

export class MouseUpStateController implements UpState {
    public clickElement: HTMLElement | null;

    protected constructor (state: MouseUpStateController) {
        this.clickElement = state.clickElement;
    }

    public static from (state?: UpState): UpState {
        if (state)
            return new MouseUpStateController(state);

        return new MouseUpStateController({
            clickElement: null
        });
    }
}
