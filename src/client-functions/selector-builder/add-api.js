import { assign } from 'lodash';
import clientFunctionBuilderSymbol from '../builder-symbol';
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


var filterNodes = (new ClientFunctionBuilder((nodes, filter, querySelectorRoot, originNode) => {
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
            if (filter(nodes[j], j, originNode))
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

function convertFilterToClientFunctionIfNecessary (callsiteName, filter, dependencies) {
    if (typeof filter === 'function') {
        var builder = filter[clientFunctionBuilderSymbol];
        var fn      = builder ? builder.fn : filter;
        var options = builder ? assign({}, builder.options, { dependencies }) : { dependencies };

        return (new ClientFunctionBuilder(fn, options, { instantiation: callsiteName })).getFunction();
    }

    return filter;
}

function createDerivativeSelectorWithFilter (getSelector, SelectorBuilder, selectorFn, filter, additionalDependencies) {
    var collectionModeSelectorBuilder = new SelectorBuilder(getSelector(), { collectionMode: true });

    var dependencies = {
        selector:    collectionModeSelectorBuilder.getFunction(),
        filter:      filter,
        filterNodes: filterNodes
    };

    dependencies = assign(dependencies, additionalDependencies);

    var builder = new SelectorBuilder(selectorFn, { dependencies }, { instantiation: 'Selector' });

    return builder.getFunction();
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

    obj.filter = (filter, dependencies) => {
        assertFunctionOrString('filter', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('filter', filter, dependencies);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            var nodes = selector();

            if (!nodes.length)
                return null;

            return filterNodes(nodes, filter, document, void 0);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter);
    };
}

function addHierachicalSelectors (obj, getSelector, SelectorBuilder) {
    // Find
    obj.find = (filter, dependencies) => {
        assertFunctionOrString('find', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

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

                        results.push(child);

                        visitNode(child);
                    }
                };

                visitNode(node);

                return filterNodes(results, filter, null, node);
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults });
    };

    // Parent
    obj.parent = (filter, dependencies) => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('parent', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                var parents = [];

                for (var parent = node.parentNode; parent; parent = parent.parentNode)
                    parents.push(parent);

                return filter !== void 0 ? filterNodes(parents, filter, document, node) : parents;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults });
    };

    // Child
    obj.child = (filter, dependencies) => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('child', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

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

                return filter !== void 0 ? filterNodes(childElements, filter, node, node) : childElements;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults });
    };

    // Sibling
    obj.sibling = (filter, dependencies) => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('sibling', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

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

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults });
    };
}

export default function addAPI (obj, getSelector, SelectorBuilder) {
    addSnapshotPropertyShorthands(obj, getSelector);
    addFilterMethods(obj, getSelector, SelectorBuilder);
    addHierachicalSelectors(obj, getSelector, SelectorBuilder);
    addCounterProperties(obj, getSelector, SelectorBuilder);
}
