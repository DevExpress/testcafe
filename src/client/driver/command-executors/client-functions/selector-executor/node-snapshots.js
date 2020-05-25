import { positionUtils, domUtils } from '../../../deps/testcafe-core';

import {
    NODE_SNAPSHOT_PROPERTIES,
    ELEMENT_SNAPSHOT_PROPERTIES,
    ELEMENT_ACTION_SNAPSHOT_PROPERTIES
} from '../../../../../client-functions/selectors/snapshot-properties';


// Node
const nodeSnapshotPropertyInitializers = {
    /*eslint-disable no-restricted-properties*/
    textContent:    node => node.textContent,
    childNodeCount: node => node.childNodes.length,
    /*eslint-enable no-restricted-properties*/
    hasChildNodes:  node => !!nodeSnapshotPropertyInitializers.childNodeCount(node),

    childElementCount: node => {
        /*eslint-disable no-restricted-properties*/
        const children = node.children;

        if (children)
            return children.length;

        // NOTE: IE doesn't have `children` for non-element nodes =/
        let childElementCount = 0;
        const childNodeCount  = node.childNodes.length;

        for (let i = 0; i < childNodeCount; i++) {
            if (node.childNodes[i].nodeType === 1)
                childElementCount++;
        }
        /*eslint-enable no-restricted-properties*/

        return childElementCount;
    },

    /*eslint-disable no-restricted-properties*/
    hasChildElements: node => !!nodeSnapshotPropertyInitializers.childElementCount(node)
    /*eslint-enable no-restricted-properties*/
};

class BaseSnapshot {
    _initializeProperties (node, properties, initializers) {
        for (let i = 0; i < properties.length; i++) {
            const property    = properties[i];
            const initializer = initializers[property];

            this[property] = initializer ? initializer(node) : node[property];
        }
    }
}

export class NodeSnapshot extends BaseSnapshot {
    constructor (node) {
        super();

        this._initializeProperties(node, NODE_SNAPSHOT_PROPERTIES, nodeSnapshotPropertyInitializers);
    }
}


// Element
const elementSnapshotPropertyInitializers = {
    tagName: element => element.tagName.toLowerCase(),
    visible: positionUtils.isElementVisible,
    focused: element => domUtils.getActiveElement() === element,

    attributes: element => {
        // eslint-disable-next-line no-restricted-properties
        const attrs  = element.attributes;
        const result = {};

        for (let i = attrs.length - 1; i >= 0; i--)
            // eslint-disable-next-line no-restricted-properties
            result[attrs[i].name] = attrs[i].value;

        return result;
    },

    boundingClientRect: element => {
        const rect = element.getBoundingClientRect();

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
        let className = element.className;

        className = typeof className.animVal === 'string' ? className.animVal : className;

        return className
            .replace(/^\s+|\s+$/g, '')
            .split(/\s+/g);
    },

    style: element => {
        const result   = {};
        const computed = window.getComputedStyle(element);

        for (let i = 0; i < computed.length; i++) {
            const prop = computed[i];

            result[prop] = computed[prop];
        }

        return result;
    },

    // eslint-disable-next-line no-restricted-properties
    innerText: element => element.innerText
};

export class ElementActionSnapshot extends BaseSnapshot {
    constructor (element) {
        super(element);

        this._initializeProperties(element, ELEMENT_ACTION_SNAPSHOT_PROPERTIES, elementSnapshotPropertyInitializers);
    }
}

export class ElementSnapshot extends NodeSnapshot {
    constructor (element) {
        super(element);

        this._initializeProperties(element, ELEMENT_SNAPSHOT_PROPERTIES, elementSnapshotPropertyInitializers);
    }
}
