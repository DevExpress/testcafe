import { processScript } from '../../deps/hammerhead';
import { positionUtils } from '../../deps/testcafe-core';
import evalFunction from './eval-function';

function sandboxed (fn) {
    var code = `(${fn.toString()})`;

    code = processScript(code, false);

    return evalFunction(code);
}

var getElementAttrs = sandboxed(element => {
    var attrs  = element.attributes;
    var result = {};

    for (var i = attrs.length - 1; i >= 0; i--)
        result[attrs[i].name] = attrs[i].value;

    return result;
});

var getChildNodes = sandboxed(node => node.childNodes);

class NodeSnapshot {
    constructor (node) {
        var childNodes = getChildNodes(node);

        this.nodeType       = node.nodeType;
        this.childNodeCount = childNodes.length;
        this.hasChildNodes  = !!this.childNodeCount;
        this.textContent    = node.textContent;
    }
}

export class ElementSnapshot extends NodeSnapshot {
    constructor (element) {
        super(element);

        this.tagName    = element.tagName.toLowerCase();
        this.attributes = getElementAttrs(element);
        this.visible    = positionUtils.isElementVisible(element);
        this.focused    = document.activeElement === element;

        var rect = element.getBoundingClientRect();

        this.boundingClientRect = {
            left:   rect.left,
            top:    rect.top,
            width:  rect.width,
            height: rect.height
        };

        [
            'namespaceURI', 'id',
            'value', 'checked',
            'scrollWidth', 'scrollHeight', 'scrollLeft', 'scrollTop',
            'offsetWidth', 'offsetHeight', 'offsetLeft', 'offsetTop',
            'clientWidth', 'clientHeight', 'clientLeft', 'clientTop'
        ].forEach(prop => this[prop] = element[prop]);
    }
}
