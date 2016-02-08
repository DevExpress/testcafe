import MouseOptions from './mouse';

export default class MoveOptions extends MouseOptions {
    constructor () {
        super();

        this.speed         = null;
        this.minMovingTime = null;
        this.dragMode      = false;
    }
}
