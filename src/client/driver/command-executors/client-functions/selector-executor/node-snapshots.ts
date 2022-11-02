import {
    NODE_SNAPSHOT_PROPERTIES,
    ELEMENT_SNAPSHOT_PROPERTIES,
    ELEMENT_ACTION_SNAPSHOT_PROPERTIES,
} from '../../../../../client-functions/selectors/snapshot-properties';
import { Dictionary } from '../../../../../configuration/interfaces';
// @ts-ignore
import { utils } from '../../../deps/hammerhead';
// @ts-ignore
import { positionUtils } from '../../../deps/testcafe-core';


const nodeSnapshotPropertyInitializers = {
    // eslint-disable-next-line no-restricted-properties
    childNodeCount: (node: Node) => node.childNodes.length,
    hasChildNodes:  (node: Node) => !!nodeSnapshotPropertyInitializers.childNodeCount(node),

    childElementCount: (node: Element) => {
        const children = node.children;

        if (children)
            // eslint-disable-next-line no-restricted-properties
            return children.length;

        // NOTE: IE doesn't have `children` for non-element nodes =/
        let childElementCount = 0;
        // eslint-disable-next-line no-restricted-properties
        const childNodeCount  = node.childNodes.length;

        for (let i = 0; i < childNodeCount; i++) {
            // eslint-disable-next-line no-restricted-properties
            if (node.childNodes[i].nodeType === 1)
                childElementCount++;
        }

        return childElementCount;
    },

    // eslint-disable-next-line no-restricted-properties
    hasChildElements: (node: Element) => !!nodeSnapshotPropertyInitializers.childElementCount(node),
};

class BaseSnapshot {
    [prop: string]: any;

    protected _initializeProperties (node: Element, properties: string[], initializers: Dictionary<(n: Element) => any>): void {
        for (const property of properties) {
            const initializer = initializers[property];

            this[property] = initializer ? initializer(node) : node[property as keyof Element];
        }
    }
}

export class NodeSnapshot extends BaseSnapshot {
    public constructor (node: Element) {
        super();

        this._initializeProperties(node, NODE_SNAPSHOT_PROPERTIES, nodeSnapshotPropertyInitializers);
    }
}


// Element
const elementSnapshotPropertyInitializers = {
    tagName: (element: Element) => element.tagName.toLowerCase(),
    visible: (element: Element) => positionUtils.isElementVisible(element),
    focused: (element: Element) => utils.dom.getActiveElement() === element,

    attributes: (element: Element) => {
        // eslint-disable-next-line no-restricted-properties
        const attrs                      = element.attributes;
        const result: Dictionary<string> = {};

        for (let i = attrs.length - 1; i >= 0; i--)
            // eslint-disable-next-line no-restricted-properties
            result[attrs[i].name] = attrs[i].value;

        return result;
    },

    boundingClientRect: (element: Element) => {
        const rect = element.getBoundingClientRect();

        return {
            left:   rect.left,
            right:  rect.right,
            top:    rect.top,
            bottom: rect.bottom,
            width:  rect.width,
            height: rect.height,
        };
    },

    classNames: (element: Element) => {
        let className = (element as Element | SVGAElement).className;

        if (typeof className.animVal === 'string')
            className = className.animVal;

        return className
            .replace(/^\s+|\s+$/g, '')
            .split(/\s+/g);
    },

    style: (element: Element) => {
        const result: Dictionary<unknown> = {};
        const computed                    = window.getComputedStyle(element);

        for (let i = 0; i < computed.length; i++) {
            const prop = computed[i] as keyof CSSStyleDeclaration;

            result[prop] = computed[prop];
        }

        return result;
    },

    // eslint-disable-next-line no-restricted-properties
    innerText: (element: Element) => (element as HTMLElement).innerText,
};

export class ElementActionSnapshot extends BaseSnapshot {
    public constructor (element: Element) {
        super();

        this._initializeProperties(element, ELEMENT_ACTION_SNAPSHOT_PROPERTIES, elementSnapshotPropertyInitializers);
    }
}

export class ElementSnapshot extends NodeSnapshot {
    public constructor (element: Element) {
        super(element);

        this._initializeProperties(element, ELEMENT_SNAPSHOT_PROPERTIES, elementSnapshotPropertyInitializers);
    }
}
