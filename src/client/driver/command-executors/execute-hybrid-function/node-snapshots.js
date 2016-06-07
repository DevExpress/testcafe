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

var getChildNodes  = sandboxed(node => node.childNodes);
var getTextContent = sandboxed(node => node.textContent);
var getClassName   = sandboxed(element => element.className);


class NodeSnapshot {
    constructor (node) {
        var childNodes = getChildNodes(node);

        this.nodeType       = node.nodeType;
        this.childNodeCount = childNodes.length;
        this.hasChildNodes  = !!this.childNodeCount;
        this.textContent    = getTextContent(node);
    }
}

export class ElementSnapshot extends NodeSnapshot {
    constructor (element) {
        super(element);

        this.tagName            = element.tagName.toLowerCase();
        this.attributes         = getElementAttrs(element);
        this.visible            = positionUtils.isElementVisible(element);
        this.focused            = document.activeElement === element;
        this.boundingClientRect = ElementSnapshot._getBoundingClientRect(element);
        this.classNames         = ElementSnapshot._getClassNames(element);

        [
            'namespaceURI', 'id',
            'value', 'checked',
            'scrollWidth', 'scrollHeight', 'scrollLeft', 'scrollTop',
            'offsetWidth', 'offsetHeight', 'offsetLeft', 'offsetTop',
            'clientWidth', 'clientHeight', 'clientLeft', 'clientTop'
        ].forEach(prop => this[prop] = element[prop]);
    }

    static _getBoundingClientRect (element) {
        var rect = element.getBoundingClientRect();

        return {
            left:   rect.left,
            top:    rect.top,
            width:  rect.width,
            height: rect.height
        };
    }

    static _getClassNames (element) {
        var className = getClassName(element);

        className = className.animVal || className;

        return className
            .replace(/^\s+|\s+$/g, '')
            .split(/\s+/g);
    }
}
