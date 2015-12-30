import MouseActionOptions from './mouse-action';

export default class MoveOptions extends MouseActionOptions {
    constructor () {
        super();

        this.speed         = null;
        this.minMovingTime = null;
        this.dragMode      = false;
    }
}
