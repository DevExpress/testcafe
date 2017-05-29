export default class DragAndDropState {
    constructor () {
        this.enabled      = false;
        this.dropAllowed  = false;
        this.element      = null;
        this.dataTransfer = null;
        this.dataStore    = null;
    }
}
