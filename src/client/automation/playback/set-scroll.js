import hammerhead from '../deps/hammerhead';
import VisibleElementAutomation from './visible-element-automation';

const Promise = hammerhead.Promise;

function calculatePosition (el, position) {
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
    constructor (element, { x, y, position, byX, byY }, offsetOptions) {
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

    run (useStrictElementCheck) {
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
