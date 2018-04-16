import { assign } from 'lodash';
import clientFunctionBuilderSymbol from '../builder-symbol';
import { ELEMENT_SNAPSHOT_PROPERTIES, NODE_SNAPSHOT_PROPERTIES } from './snapshot-properties';
import { CantObtainInfoForElementSpecifiedBySelectorError } from '../../errors/test-run';
import { getCallsiteForMethod } from '../../errors/get-callsite';
import ClientFunctionBuilder from '../client-function-builder';
import ReExecutablePromise from '../../utils/re-executable-promise';
import { assertType, is } from '../../errors/runtime/type-assertions';
import makeRegExp from '../../utils/make-reg-exp';
import selectorTextFilter from './selector-text-filter';
import selectorAttributeFilter from './selector-attribute-filter';

const SNAPSHOT_PROPERTIES = NODE_SNAPSHOT_PROPERTIES.concat(ELEMENT_SNAPSHOT_PROPERTIES);


var filterNodes = (new ClientFunctionBuilder((nodes, filter, querySelectorRoot, originNode, ...filterArgs) => {
    if (typeof filter === 'number') {
        var matchingNode = filter < 0 ? nodes[nodes.length + filter] : nodes[filter];

        return matchingNode ? [matchingNode] : [];
    }

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
            if (filter(nodes[j], j, originNode, ...filterArgs))
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

function assertAddCustomDOMPropertiesOptions (properties) {
    assertType(is.nonNullObject, 'addCustomDOMProperties', '"addCustomDOMProperties" option', properties);

    Object.keys(properties).forEach(prop => {
        assertType(is.function, 'addCustomDOMProperties', `Custom DOM properties method '${prop}'`, properties[prop]);
    });
}

function assertAddCustomMethods (properties, opts) {
    assertType(is.nonNullObject, 'addCustomMethods', '"addCustomMethods" option', properties);

    if (opts !== void 0)
        assertType(is.nonNullObject, 'addCustomMethods', '"addCustomMethods" option', opts);

    Object.keys(properties).forEach(prop => {
        assertType(is.function, 'addCustomMethods', `Custom method '${prop}'`, properties[prop]);
    });
}

function addSnapshotProperties (obj, getSelector, properties) {
    properties.forEach(prop => {
        Object.defineProperty(obj, prop, {
            get: () => {
                var callsite = getCallsiteForMethod('get');

                return ReExecutablePromise.fromFn(async () => {
                    var snapshot = await getSnapshot(getSelector, callsite);

                    return snapshot[prop];
                });
            }
        });
    });
}

export function addCustomMethods (obj, getSelector, SelectorBuilder, customMethods) {
    const customMethodProps = customMethods ? Object.keys(customMethods) : [];

    customMethodProps.forEach(prop => {
        const { returnDOMNodes = false, method } = customMethods[prop];

        const dependencies = {
            customMethod: method,
            selector:     getSelector()
        };

        const callsiteNames = { instantiation: prop };

        if (returnDOMNodes) {
            obj[prop] = (...args) => {
                const selectorFn = () => {
                    /* eslint-disable no-undef */
                    const nodes = selector();

                    return customMethod.apply(customMethod, [nodes].concat(args));
                    /* eslint-enable no-undef */
                };

                return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, () => true, {
                    args,
                    customMethod: method
                });
            };
        }
        else {
            obj[prop] = (new ClientFunctionBuilder((...args) => {
                /* eslint-disable no-undef */
                const node = selector();

                return customMethod.apply(customMethod, [node].concat(args));
                /* eslint-enable no-undef */
            }, { dependencies }, callsiteNames)).getFunction();
        }
    });
}

function addSnapshotPropertyShorthands (obj, getSelector, SelectorBuilder, customDOMProperties, customMethods) {
    var properties = SNAPSHOT_PROPERTIES;

    if (customDOMProperties)
        properties = properties.concat(Object.keys(customDOMProperties));

    addSnapshotProperties(obj, getSelector, properties);
    addCustomMethods(obj, getSelector, SelectorBuilder, customMethods);

    obj.getStyleProperty = prop => {
        var callsite = getCallsiteForMethod('getStyleProperty');

        return ReExecutablePromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.style ? snapshot.style[prop] : void 0;
        });
    };

    obj.getAttribute = attrName => {
        var callsite = getCallsiteForMethod('getAttribute');

        return ReExecutablePromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.attributes ? snapshot.attributes[attrName] : void 0;
        });
    };

    obj.hasAttribute = attrName => {
        var callsite = getCallsiteForMethod('hasAttribute');

        return ReExecutablePromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.attributes ? snapshot.attributes.hasOwnProperty(attrName) : false;
        });
    };

    obj.getBoundingClientRectProperty = prop => {
        var callsite = getCallsiteForMethod('getBoundingClientRectProperty');

        return ReExecutablePromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.boundingClientRect ? snapshot.boundingClientRect[prop] : void 0;
        });
    };

    obj.hasClass = name => {
        var callsite = getCallsiteForMethod('hasClass');

        return ReExecutablePromise.fromFn(async () => {
            var snapshot = await getSnapshot(getSelector, callsite);

            return snapshot.classNames ? snapshot.classNames.indexOf(name) > -1 : false;
        });
    };
}

function createCounter (getSelector, SelectorBuilder) {
    var builder  = new SelectorBuilder(getSelector(), { counterMode: true }, { instantiation: 'Selector' });
    var counter  = builder.getFunction();
    var callsite = getCallsiteForMethod('get');

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

            return ReExecutablePromise.fromFn(() => counter());
        }
    });

    Object.defineProperty(obj, 'exists', {
        get: () => {
            var counter = createCounter(getSelector, SelectorBuilder);

            return ReExecutablePromise.fromFn(async () => await counter() > 0);
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
    var customDOMProperties           = collectionModeSelectorBuilder.options.customDOMProperties;
    var customMethods                 = collectionModeSelectorBuilder.options.customMethods;

    var dependencies = {
        selector:    collectionModeSelectorBuilder.getFunction(),
        filter:      filter,
        filterNodes: filterNodes
    };

    var { boundTestRun, timeout, visibilityCheck } = collectionModeSelectorBuilder.options;

    dependencies = assign(dependencies, additionalDependencies);

    var builder = new SelectorBuilder(selectorFn, {
        dependencies,
        customDOMProperties,
        customMethods,
        boundTestRun,
        timeout,
        visibilityCheck
    }, { instantiation: 'Selector' });

    return builder.getFunction();
}

var filterByText = convertFilterToClientFunctionIfNecessary('filter', selectorTextFilter);
var filterByAttr = convertFilterToClientFunctionIfNecessary('filter', selectorAttributeFilter);

function ensureRegExpContext (str) {
    // NOTE: if a regexp is created in a separate context (via the 'vm' module) we
    // should wrap it with new RegExp() to make the `instanceof RegExp` check successful.
    if (typeof str !== 'string' && !(str instanceof RegExp))
        return new RegExp(str);

    return str;
}

function addFilterMethods (obj, getSelector, SelectorBuilder) {
    obj.nth = index => {
        assertType(is.number, 'nth', '"index" argument', index);

        var builder = new SelectorBuilder(getSelector(), { index: index }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.withText = text => {
        assertType([is.string, is.regExp], 'withText', '"text" argument', text);

        text = ensureRegExpContext(text);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            var nodes = selector();

            if (!nodes.length)
                return null;

            return filterNodes(nodes, filter, document, void 0, textRe);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filterByText, {
            textRe: makeRegExp(text)
        });
    };

    obj.withExactText = text => {
        assertType(is.string, 'withExactText', '"text" argument', text);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            var nodes = selector();

            if (!nodes.length)
                return null;

            return filterNodes(nodes, filter, document, void 0, exactText);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filterByText, {
            exactText: text
        });
    };

    obj.withAttribute = (attrName, attrValue) => {
        assertType([is.string, is.regExp], 'withAttribute', '"attrName" argument', attrName);

        attrName = ensureRegExpContext(attrName);

        if (attrValue !== void 0) {
            assertType([is.string, is.regExp], 'withAttribute', '"attrValue" argument', attrValue);
            attrValue = ensureRegExpContext(attrValue);
        }

        var selectorFn = () => {
            /* eslint-disable no-undef */
            var nodes = selector();

            if (!nodes.length)
                return null;

            return filterNodes(nodes, filter, document, void 0, attrName, attrValue);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filterByAttr, {
            attrName,
            attrValue
        });
    };

    obj.filter = (filter, dependencies) => {
        assertType([is.string, is.function], 'filter', '"filter" argument', filter);

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

    obj.filterVisible = () => {
        const builder = new SelectorBuilder(getSelector(), { filterVisible: true }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.filterHidden = () => {
        const builder = new SelectorBuilder(getSelector(), { filterHidden: true }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addCustomDOMPropertiesMethod (obj, getSelector, SelectorBuilder) {
    obj.addCustomDOMProperties = customDOMProperties => {
        assertAddCustomDOMPropertiesOptions(customDOMProperties);

        var builder = new SelectorBuilder(getSelector(), { customDOMProperties }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addCustomMethodsMethod (obj, getSelector, SelectorBuilder) {
    obj.addCustomMethods = function (methods, opts) {
        assertAddCustomMethods(methods, opts);

        const customMethods = {};

        Object.keys(methods).forEach(methodName => {
            customMethods[methodName] = {
                method:         methods[methodName],
                returnDOMNodes: opts && !!opts.returnDOMNodes
            };
        });

        const builder = new SelectorBuilder(getSelector(), { customMethods }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addHierarchicalSelectors (obj, getSelector, SelectorBuilder) {
    // Find
    obj.find = (filter, dependencies) => {
        assertType([is.string, is.function], 'find', '"filter" argument', filter);

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
            assertType([is.string, is.function, is.number], 'parent', '"filter" argument', filter);

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
            assertType([is.string, is.function, is.number], 'child', '"filter" argument', filter);

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
            assertType([is.string, is.function, is.number], 'sibling', '"filter" argument', filter);

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

    // Next sibling
    obj.nextSibling = (filter, dependencies) => {
        if (filter !== void 0)
            assertType([is.string, is.function, is.number], 'nextSibling', '"filter" argument', filter);

        filter = convertFilterToClientFunctionIfNecessary('find', filter, dependencies);

        var selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                var parent = node.parentNode;

                if (!parent)
                    return null;

                var siblings  = [];
                var cnLength  = parent.childNodes.length;
                var afterNode = false;

                for (var i = 0; i < cnLength; i++) {
                    var child = parent.childNodes[i];

                    if (child === node)
                        afterNode = true;

                    else if (afterNode && child.nodeType === 1)
                        siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults });
    };

    // Prev sibling
    obj.prevSibling = (filter, dependencies) => {
        if (filter !== void 0)
            assertType([is.string, is.function, is.number], 'prevSibling', '"filter" argument', filter);

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

                    if (child === node)
                        break;

                    if (child.nodeType === 1)
                        siblings.push(child);
                }

                return filter !== void 0 ? filterNodes(siblings, filter, parent, node) : siblings;
            });
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter, { expandSelectorResults });
    };

}

export function addAPI (obj, getSelector, SelectorBuilder, customDOMProperties, customMethods) {
    addSnapshotPropertyShorthands(obj, getSelector, SelectorBuilder, customDOMProperties, customMethods);
    addCustomDOMPropertiesMethod(obj, getSelector, SelectorBuilder);
    addCustomMethodsMethod(obj, getSelector, SelectorBuilder);
    addFilterMethods(obj, getSelector, SelectorBuilder);
    addHierarchicalSelectors(obj, getSelector, SelectorBuilder);
    addCounterProperties(obj, getSelector, SelectorBuilder);
}
