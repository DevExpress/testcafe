import { Promise, nativeMethods } from '../deps/hammerhead';

import { domUtils } from '../deps/testcafe-core';

import NODE_TYPE_DESCRIPTIONS from '../node-type-descriptions';

import SelectorExecutor from '../command-executors/client-functions/selector-executor';

import {
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    ActionSelectorMatchesWrongNodeTypeError,
    ActionAdditionalElementNotFoundError,
    ActionAdditionalElementIsInvisibleError,
    ActionAdditionalSelectorMatchesWrongNodeTypeError,
} from '../../../shared/errors';

const DateCtor = nativeMethods.date;

class ElementsRetriever {
    constructor (elementDescriptors, globalSelectorTimeout) {
        this.elements                = [];
        this.globalSelectorTimeout   = globalSelectorTimeout;
        this.ensureElementsPromise   = Promise.resolve();
        this.ensureElementsStartTime = new DateCtor();

        elementDescriptors.forEach(descriptor => this._ensureElement(descriptor));
    }

    _ensureElement ({ selector, createNotFoundError, createIsInvisibleError, createHasWrongNodeTypeError }) {
        this.ensureElementsPromise = this.ensureElementsPromise
            .then(() => {
                const selectorExecutor = new SelectorExecutor(selector, this.globalSelectorTimeout, this.ensureElementsStartTime,
                    createNotFoundError, createIsInvisibleError);

                return selectorExecutor.getResult();
            })
            .then(el => {
                if (!domUtils.isDomElement(el))
                    throw createHasWrongNodeTypeError(NODE_TYPE_DESCRIPTIONS[el.nodeType]);

                this.elements.push(el);
            });
    }

    getElements () {
        return this.ensureElementsPromise
            .then(() => this.elements);
    }
}

export function ensureElements (elementDescriptors, globalSelectorTimeout) {
    const elementsRetriever = new ElementsRetriever(elementDescriptors, globalSelectorTimeout);

    return elementsRetriever.getElements();
}

export function createElementDescriptor (selector) {
    return {
        selector:                    selector,
        createNotFoundError:         fn => new ActionElementNotFoundError(null, fn),
        createIsInvisibleError:      fn => new ActionElementIsInvisibleError(null, fn),
        createHasWrongNodeTypeError: nodeDescription => new ActionSelectorMatchesWrongNodeTypeError(nodeDescription),
    };
}

export function createAdditionalElementDescriptor (selector, elementName) {
    return {
        selector:                    selector,
        createNotFoundError:         fn => new ActionAdditionalElementNotFoundError(elementName, fn),
        createIsInvisibleError:      () => new ActionAdditionalElementIsInvisibleError(elementName),
        createHasWrongNodeTypeError: nodeDescription => new ActionAdditionalSelectorMatchesWrongNodeTypeError(elementName, nodeDescription),
    };
}
