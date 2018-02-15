import { positionUtils, domUtils } from '../../../deps/testcafe-core';

import {
    NODE_SNAPSHOT_PROPERTIES,
    ELEMENT_SNAPSHOT_PROPERTIES
} from '../../../../../client-functions/selectors/snapshot-properties';

import {
    getAttrs,
    getTextContent,
    getClassName,
    getInnerText
} from './sandboxed-node-properties';


// Node
var nodeSnapshotPropertyInitializers = {
    textContent:    getTextContent,
    childNodeCount: node => node.childNodes.length,
    hasChildNodes:  node => !!nodeSnapshotPropertyInitializers.childNodeCount(node),

    childElementCount: node => {
        /*eslint-disable no-restricted-properties*/
        var children = node.children;

        if (children)
            return children.length;

        // NOTE: IE doesn't have `children` for non-element nodes =/
        var childElementCount = 0;
        var childNodeCount    = node.childNodes.length;
        /*eslint-enable no-restricted-properties*/

        for (var i = 0; i < childNodeCount; i++) {
            if (node.childNodes[i].nodeType === 1)
                childElementCount++;
        }

        return childElementCount;
    },

    /*eslint-disable no-restricted-properties*/
    hasChildElements: node => !!nodeSnapshotPropertyInitializers.childElementCount(node)
    /*eslint-enable no-restricted-properties*/
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

        /*eslint-disable no-restricted-properties*/
        for (var i = attrs.length - 1; i >= 0; i--)
            result[attrs[i].name] = attrs[i].value;
        /*eslint-enable no-restricted-properties*/

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
