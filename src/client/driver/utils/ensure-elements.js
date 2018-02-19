import { Promise } from '../deps/hammerhead';

import { domUtils, NODE_TYPE_DESCRIPTIONS } from '../deps/testcafe-core';

import SelectorExecutor from '../command-executors/client-functions/selector-executor';

import {
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    ActionSelectorMatchesWrongNodeTypeError,
    ActionAdditionalElementNotFoundError,
    ActionAdditionalElementIsInvisibleError,
    ActionAdditionalSelectorMatchesWrongNodeTypeError
} from '../../../errors/test-run';


class ElementsRetriever {
    constructor (elementDescriptors, globalSelectorTimeout) {
        this.elements                = [];
        this.globalSelectorTimeout   = globalSelectorTimeout;
        this.ensureElementsPromise   = Promise.resolve();
        this.ensureElementsStartTime = new Date();

        elementDescriptors.forEach(descriptor => this._ensureElement(descriptor));
    }

    _ensureElement ({ selector, createNotFoundError, createIsInvisibleError, createHasWrongNodeTypeError }) {
        this.ensureElementsPromise = this.ensureElementsPromise
            .then(() => {
                var selectorExecutor = new SelectorExecutor(selector, this.globalSelectorTimeout, this.ensureElementsStartTime,
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
    var elementsRetriever = new ElementsRetriever(elementDescriptors, globalSelectorTimeout);

    return elementsRetriever.getElements();
}

export function createElementDescriptor (selector) {
    return {
        selector:                    selector,
        createNotFoundError:         () => new ActionElementNotFoundError(),
        createIsInvisibleError:      () => new ActionElementIsInvisibleError(),
        createHasWrongNodeTypeError: nodeDescription => new ActionSelectorMatchesWrongNodeTypeError(nodeDescription)
    };
}

export function createAdditionalElementDescriptor (selector, elementName) {
    return {
        selector:                    selector,
        createNotFoundError:         () => new ActionAdditionalElementNotFoundError(elementName),
        createIsInvisibleError:      () => new ActionAdditionalElementIsInvisibleError(elementName),
        createHasWrongNodeTypeError: nodeDescription => new ActionAdditionalSelectorMatchesWrongNodeTypeError(elementName, nodeDescription)
    };
}
