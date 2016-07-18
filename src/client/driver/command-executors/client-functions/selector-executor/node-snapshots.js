import { positionUtils } from '../../../deps/testcafe-core';

import {
    getAttrs,
    getChildNodes,
    getChildren,
    getTextContent,
    getClassName,
    getInnerText
} from './sandboxed-node-properties';

export class NodeSnapshot {
    constructor (node) {
        this.nodeType    = node.nodeType;
        this.textContent = getTextContent(node);

        this.childNodeCount = getChildNodes(node).length;
        this.hasChildNodes  = !!this.childNodeCount;

        this.childElementCount = NodeSnapshot._getChildElementCount(node);
        this.hasChildElements  = !!this.childElementCount;
    }

    static _getChildElementCount (node) {
        var children = getChildren(node);

        if (children)
            return children.length;

        // NOTE: IE doesn't have `children` for non-element nodes =/
        var childElementCount = 0;
        var childNodeCount    = node.childNodes.length;

        for (var i = 0; i < childNodeCount; i++) {
            if (node.childNodes[i].nodeType === 1)
                childElementCount++;
        }

        return childElementCount;
    }
}

export class ElementSnapshot extends NodeSnapshot {
    constructor (element) {
        super(element);

        this.tagName            = element.tagName.toLowerCase();
        this.visible            = positionUtils.isElementVisible(element);
        this.focused            = document.activeElement === element;
        this.attributes         = ElementSnapshot._getAttrsDictionary(element);
        this.boundingClientRect = ElementSnapshot._getBoundingClientRect(element);
        this.classNames         = ElementSnapshot._getClassNames(element);
        this.style              = ElementSnapshot._getStyle(element);
        this.innerText          = getInnerText(element);

        [
            'namespaceURI', 'id',
            'value', 'checked',
            'scrollWidth', 'scrollHeight', 'scrollLeft', 'scrollTop',
            'offsetWidth', 'offsetHeight', 'offsetLeft', 'offsetTop',
            'clientWidth', 'clientHeight', 'clientLeft', 'clientTop'
        ].forEach(prop => {
            this[prop] = element[prop];
        });
    }

    static _getBoundingClientRect (element) {
        var rect = element.getBoundingClientRect();

        return {
            left:   rect.left,
            right:  rect.right,
            top:    rect.top,
            bottom: rect.bottom,
            width:  rect.width,
            height: rect.height
        };
    }

    static _getClassNames (element) {
        var className = getClassName(element);

        className = typeof className.animVal === 'string' ? className.animVal : className;

        return className
            .replace(/^\s+|\s+$/g, '')
            .split(/\s+/g);
    }

    static _getAttrsDictionary (element) {
        var attrs  = getAttrs(element);
        var result = {};

        for (var i = attrs.length - 1; i >= 0; i--)
            result[attrs[i].name] = attrs[i].value;

        return result;
    }

    static _getStyle (element) {
        var result   = {};
        var computed = window.getComputedStyle(element);

        for (var i = 0; i < computed.length; i++) {
            var prop = computed[i];

            result[prop] = computed[prop];
        }

        return result;
    }
}
