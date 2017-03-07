import { positionUtils, domUtils } from '../../../deps/testcafe-core';

import {
    NODE_SNAPSHOT_PROPERTIES,
    ELEMENT_SNAPSHOT_PROPERTIES
} from '../../../../../client-functions/selectors/snapshot-properties';

import {
    getAttrs,
    getChildNodes,
    getChildren,
    getTextContent,
    getClassName,
    getInnerText
} from './sandboxed-node-properties';


// Node
var nodeSnapshotPropertyInitializers = {
    textContent:    getTextContent,
    childNodeCount: node => getChildNodes(node).length,
    hasChildNodes:  node => !!nodeSnapshotPropertyInitializers.childNodeCount(node),

    childElementCount: node => {
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
    },

    hasChildElements: node => !!nodeSnapshotPropertyInitializers.childElementCount(node)
};

export class NodeSnapshot {
    constructor (node) {
        this._initializeProperties(node, NODE_SNAPSHOT_PROPERTIES, nodeSnapshotPropertyInitializers);
    }

    _initializeProperties (node, properties, initializers) {
        for (var i = 0; i < properties.length; i++) {
            var property    = properties[i];
            var initializer = initializers[property];

            this[property] = initializer ? initializer(node) : node[property];
        }
    }
}


// Element
var elementSnapshotPropertyInitializers = {
    tagName: element => element.tagName.toLowerCase(),
    visible: positionUtils.isElementVisible,
    focused: element => domUtils.getActiveElement() === element,

    attributes: element => {
        var attrs  = getAttrs(element);
        var result = {};

        for (var i = attrs.length - 1; i >= 0; i--)
            result[attrs[i].name] = attrs[i].value;

        return result;
    },

    boundingClientRect: element => {
        var rect = element.getBoundingClientRect();

        return {
            left:   rect.left,
            right:  rect.right,
            top:    rect.top,
            bottom: rect.bottom,
            width:  rect.width,
            height: rect.height
        };
    },

    classNames: element => {
        var className = getClassName(element);

        className = typeof className.animVal === 'string' ? className.animVal : className;

        return className
            .replace(/^\s+|\s+$/g, '')
            .split(/\s+/g);
    },

    style: element => {
        var result   = {};
        var computed = window.getComputedStyle(element);

        for (var i = 0; i < computed.length; i++) {
            var prop = computed[i];

            result[prop] = computed[prop];
        }

        return result;
    },

    innerText: getInnerText
};

export class ElementSnapshot extends NodeSnapshot {
    constructor (element) {
        super(element);

        this._initializeProperties(element, ELEMENT_SNAPSHOT_PROPERTIES, elementSnapshotPropertyInitializers);
    }
}
