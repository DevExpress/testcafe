import OffsetOptions from './offset';

export default class MouseOptions extends OffsetOptions {
    constructor () {
        super();

        this.modifiers = {
            ctrl:  false,
            alt:   false,
            shift: false,
            meta:  false
        };
    }
}
