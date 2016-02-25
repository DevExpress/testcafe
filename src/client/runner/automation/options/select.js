export default class SelectOptions {
    constructor () {
        // NOTE: start and end positions can be defined by integer values (for 'inputs'
        // and 'textareas') or {node, offset} objects (for contentEditable elements)
        this.startPos = null;
        this.endPos   = null;
    }
}
