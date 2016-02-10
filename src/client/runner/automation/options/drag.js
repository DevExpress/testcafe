import MouseOptions from './mouse.js';

export default class DragOptions extends MouseOptions {
    constructor () {
        super();

        this.destinationElement = null;
        this.dragOffsetX        = null;
        this.dragOffsetY        = null;
    }
}
