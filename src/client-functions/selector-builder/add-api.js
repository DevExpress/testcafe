import { assign } from 'lodash';
import { ELEMENT_SNAPSHOT_PROPERTIES, NODE_SNAPSHOT_PROPERTIES } from './snapshot-properties';
import { CantObtainInfoForElementSpecifiedBySelectorError } from '../../errors/test-run';
import getCallsite from '../../errors/get-callsite';
import ClientFunctionBuilder from '../client-function-builder';
import SelectorResultPromise from './result-promise';
import {
    assertStringOrRegExp,
    assertNonNegativeNumber,
    assertFunctionOrString,
    assertFunctionOrStringOnNonNegativeNumber
} from '../../errors/runtime/type-assertions';

const SNAPSHOT_PROPERTIES = NODE_SNAPSHOT_PROPERTIES.concat(ELEMENT_SNAPSHOT_PROPERTIES);


var filterNodes = (new ClientFunctionBuilder((nodes, filter, querySelectorRoot) => {
    if (typeof filter === 'number')
        return [nodes[filter]];

    var result = [];

    if (typeof filter === 'string') {
        // NOTE: we can search for elements only in document or element.
        if (querySelectorRoot.nodeType !== 1 && querySelectorRoot.nodeType !== 9)
            return null;

        var matching    = querySelectorRoot.querySelectorAll(filter);
        var matchingArr = [];

        for (var i = 0; i < matching.length; i++)
            matchingArr.push(matching[i]);

        filter = node => matchingArr.indexOf(node) > -1;
    }

    if (typeof filter === 'function') {
        for (var j = 0; j < nodes.length; j++) {
            if (filter(nodes[j]))
                result.push(nodes[j]);
        }
    }

    return result;
})).getFunction();


var expandSelectorResults = (new ClientFunctionBuilder((selector, populateDerivativeNodes) => {
    var nodes = selector();

    if (!nodes.length)
        return null;

    var result = [];

    for (var i = 0; i < nodes.length; i++) {
        var derivativeNodes = populateDerivativeNodes(nodes[i]);

        if (derivativeNodes) {
            for (var j = 0; j < derivativeNodes.length; j++) {
                if (result.indexOf(derivativeNodes[j]) < 0)
                    result.push(derivativeNodes[j]);
            }
        }
    }

    return result;

})).getFunction();

async function getSnapshot (getSelector, callsite) {
    var node     = null;
    var selector = getSelector();

    try {
        node = await selector();
    }

    catch (err) {
        err.callsite = callsite;
        throw err;
    }

    if (!node)
        throw new CantObtainInfoForElementSpecifiedBySelectorError(callsite);

    return node;
}

function addSnapshotPropertyShorthands (obj, getSelector) {
    SNAPSHOT_PROPERTIES.forEach(prop => {
        Object.defineProperty(obj, prop, {
            get: () => {
                var callsite = getCallsite('get');

                return SelectorResultPromise.fromFn(async () => {
                    var snapshot = await getSnapshot(getSelector, callsite);

                    return snapshot[prop];
                });
            }
        });
    });

    obj.getStyleProperty = prop => {
        var callsite = getCallsite('getStyleProperty');

        return SelectorResultPromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.style ? snapshot.style[prop] : void 0;
        });
    };

    obj.getAttribute = attrName => {
        var callsite = getCallsite('getAttribute');

        return SelectorResultPromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.attributes ? snapshot.attributes[attrName] : void 0;
        });
    };

    obj.getBoundingClientRectProperty = prop => {
        var callsite = getCallsite('getBoundingClientRectProperty');

        return SelectorResultPromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.boundingClientRect ? snapshot.boundingClientRect[prop] : void 0;
        });
    };

    obj.hasClass = name => {
        var callsite = getCallsite('hasClass');

        return SelectorResultPromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.classNames ? snapshot.classNames.indexOf(name) > -1 : false;
        });
    };
}

function createCounter (getSelector, SelectorBuilder) {
    var builder  = new SelectorBuilder(getSelector(), { counterMode: true }, { instantiation: 'Selector' });
    var counter  = builder.getFunction();
    var callsite = getCallsite('get');

    return async () => {
        try {
            return await counter();
        }

        catch (err) {
            err.callsite = callsite;
            throw err;
        }
    };
}

function addCounterProperties (obj, getSelector, SelectorBuilder) {
    Object.defineProperty(obj, 'count', {
        get: () => {
            var counter = createCounter(getSelector, SelectorBuilder);

            return SelectorResultPromise.fromFn(() => counter());
        }
    });

    Object.defineProperty(obj, 'exists', {
        get: () => {
            var counter = createCounter(getSelector, SelectorBuilder);

            return SelectorResultPromise.fromFn(async () => await counter() > 0);
        }
    });
}

function addFilterMethods (obj, getSelector, SelectorBuilder) {
    obj.nth = index => {
        assertNonNegativeNumber('nth', '"index" argument', index);

        var builder = new SelectorBuilder(getSelector(), { index: index }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.withText = text => {
        assertStringOrRegExp('withText', '"text" argument', text);

        var builder = new SelectorBuilder(getSelector(), { text: text }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function createHierachicalSelector (getSelector, SelectorBuilder, selectorFn, filter, additionalDependencies) {
    var collectionModeSelectorBuilder = new SelectorBuilder(getSelector(), { collectionMode: true });

    var dependencies = {
        selector:              collectionModeSelectorBuilder.getFunction(),
        filter:                filter,
        expandSelectorResults: expandSelectorResults
    };

    dependencies = assign(dependencies, additionalDependencies);

    var builder = new SelectorBuilder(selectorFn, { dependencies }, { instantiation: 'Selector' });

    return builder.getFunction();
}

function addHierachicalSelectors (obj, getSelector, SelectorBuilder) {
    // Find
    obj.find = filter => {
        assertFunctionOrString('find', '"filter" argument', filter);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                if (typeof filter === 'string') {
                    return typeof node.querySelectorAll === 'function' ?
                           node.querySelectorAll(filter) :
                           null;
                }

                var results = [];

                var visitNode = currentNode => {
                    var cnLength = currentNode.childNodes.length;

                    for (var i = 0; i < cnLength; i++) {
                        var child = currentNode.childNodes[i];

                        if (filter(child))
                            results.push(child);

                        visitNode(child);
                    }
                };

                visitNode(node);

                return results;
            });
            /* eslint-enable no-undef */
        };

        return createHierachicalSelector(getSelector, SelectorBuilder, selectorFn, filter);
    };

    // Parent
    obj.parent = filter => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('parent', '"filter" argument', filter);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                var parents = [];

                for (node = node.parentNode; node; node = node.parentNode)
                    parents.push(node);

                return filter !== void 0 ? filterNodes(parents, filter, document) : parents;
            });
            /* eslint-enable no-undef */
        };

        return createHierachicalSelector(getSelector, SelectorBuilder, selectorFn, filter, { filterNodes });
    };

    // Child
    obj.child = filter => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('child', '"filter" argument', filter);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                var childElements = [];
                var cnLength      = node.childNodes.length;

                for (var i = 0; i < cnLength; i++) {
                    var child = node.childNodes[i];

                    if (child.nodeType === 1)
                        childElements.push(child);
                }

                return filter !== void 0 ? filterNodes(childElements, filter, node) : childElements;
            });
            /* eslint-enable no-undef */
        };

        return createHierachicalSelector(getSelector, SelectorBuilder, selectorFn, filter, { filterNodes });
    };

    // Sibling
    obj.sibling = filter => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('sibling', '"filter" argument', filter);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                var parent = node.parentNode;

                if (!parent)
                    return null;

                var siblings = [];
                var cnLength = parent.childNodes.length;

                for (var i = 0; i < cnLength; i++) {
                    var child = parent.childNodes[i];

                    if (child.nodeType === 1 && child !== node)
                        siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent) : siblings;
            });
            /* eslint-enable no-undef */
        };

        return createHierachicalSelector(getSelector, SelectorBuilder, selectorFn, filter, { filterNodes });
    };
}

export default function addAPI (obj, getSelector, SelectorBuilder) {
    addSnapshotPropertyShorthands(obj, getSelector);
    addFilterMethods(obj, getSelector, SelectorBuilder);
    addHierachicalSelectors(obj, getSelector, SelectorBuilder);
    addCounterProperties(obj, getSelector, SelectorBuilder);
}
