import hammerhead from '../deps/hammerhead';
import VisibleElementAutomation from './visible-element-automation';
import { OffsetOptions } from '../../../test-run/commands/options';

const Promise = hammerhead.Promise;

type ScrollPosition = 'top' | 'right' | 'bottom' | 'left' | 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' | 'center';

interface SetScrollAutomationOptions {
    x?: number;
    y?: number;
    position?: ScrollPosition;
    byX?: number;
    byY?: number;
}

function calculatePosition (el: HTMLElement, position: ScrollPosition): number[] {
    const centerX = Math.floor(el.scrollWidth / 2 - el.clientWidth / 2);
    const centerY = Math.floor(el.scrollHeight / 2 - el.clientHeight / 2);


    const positions = {
        'top':         [ centerX, 0],
        'right':       [ el.scrollWidth, centerY],
        'bottom':      [ centerX, el.scrollHeight],
        'left':        [ 0, centerY],
        'topRight':    [ el.scrollWidth, 0],
        'topLeft':     [ 0, 0],
        'bottomRight': [ el.scrollWidth, el.scrollHeight],
        'bottomLeft':  [ 0, el.scrollHeight],
        'center':      [ centerX, centerY],
    };

    return positions[position];
}

export default class SetScrollAutomation extends VisibleElementAutomation {
    private scrollLeft: number;
    private scrollTop: number;

    public constructor (element: HTMLElement, { x, y, position, byX, byY }: SetScrollAutomationOptions, offsetOptions: OffsetOptions) {
        super(element, offsetOptions);

        if (position)
            [x, y] = calculatePosition(element, position);

        this.scrollLeft = typeof x === 'number' ? x : element.scrollLeft;
        this.scrollTop  = typeof y === 'number' ? y : element.scrollTop;

        if (byX)
            this.scrollLeft += byX;

        if (byY)
            this.scrollTop += byY;
    }

    public run (useStrictElementCheck: boolean): Promise<void> {
        let promise = Promise.resolve();

        if (this.element !== document.scrollingElement && this.element !== document.documentElement)
            promise = this._ensureElement(useStrictElementCheck, true, true);

        return promise
            .then(() => {
                this.element.scrollLeft = this.scrollLeft;
                this.element.scrollTop  = this.scrollTop;
            });
    }
}
