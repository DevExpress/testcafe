import OffsetOptions from './offset';

export default class MouseActionOptions extends OffsetOptions {
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
