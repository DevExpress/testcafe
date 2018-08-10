import { assign } from 'lodash';
import clientFunctionBuilderSymbol from '../builder-symbol';
import { SNAPSHOT_PROPERTIES } from './snapshot-properties';
import { getCallsiteForMethod } from '../../errors/get-callsite';
import ClientFunctionBuilder from '../client-function-builder';
import ReExecutablePromise from '../../utils/re-executable-promise';
import { assertType, is } from '../../errors/runtime/type-assertions';
import makeRegExp from '../../utils/make-reg-exp';
import selectorTextFilter from './selector-text-filter';
import selectorAttributeFilter from './selector-attribute-filter';

let apiFn = null;

const filterNodes = (new ClientFunctionBuilder((nodes, filter, querySelectorRoot, originNode, ...filterArgs) => {
    if (typeof filter === 'number') {
        const matchingNode = filter < 0 ? nodes[nodes.length + filter] : nodes[filter];

        return matchingNode ? [matchingNode] : [];
    }

    const result = [];

    if (typeof filter === 'string') {
        // NOTE: we can search for elements only in document or element.
        if (querySelectorRoot.nodeType !== 1 && querySelectorRoot.nodeType !== 9)
            return null;

        const matching    = querySelectorRoot.querySelectorAll(filter);
        const matchingArr = [];

        for (let i = 0; i < matching.length; i++)
            matchingArr.push(matching[i]);

        filter = node => matchingArr.indexOf(node) > -1;
    }

    if (typeof filter === 'function') {
        for (let j = 0; j < nodes.length; j++) {
            if (filter(nodes[j], j, originNode, ...filterArgs))
                result.push(nodes[j]);
        }
    }

    return result;
})).getFunction();

const expandSelectorResults = (new ClientFunctionBuilder((selector, populateDerivativeNodes) => {
    const nodes = selector();

    if (!nodes.length)
        return null;

    const result = [];

    for (let i = 0; i < nodes.length; i++) {
        const derivativeNodes = populateDerivativeNodes(nodes[i]);

        if (derivativeNodes) {
            for (let j = 0; j < derivativeNodes.length; j++) {
                if (result.indexOf(derivativeNodes[j]) < 0)
                    result.push(derivativeNodes[j]);
            }
        }
    }

    return result;

})).getFunction();

async function getSnapshot (getSelector, callsite, SelectorBuilder) {
    let node       = null;
    const selector = new SelectorBuilder(getSelector(), { needError: true }, { instantiation: 'Selector' }).getFunction();

    try {
        node = await selector();
    }

    catch (err) {
        err.callsite = callsite;
        throw err;
    }

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

function addSnapshotProperties (obj, getSelector, SelectorBuilder, properties) {
    properties.forEach(prop => {
        Object.defineProperty(obj, prop, {
            get: () => {
                const callsite = getCallsiteForMethod('get');

                return ReExecutablePromise.fromFn(async () => {
                    const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);

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

            wrapApiChainFunction(obj, prop);
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
    let properties = SNAPSHOT_PROPERTIES;

    if (customDOMProperties)
        properties = properties.concat(Object.keys(customDOMProperties));

    addSnapshotProperties(obj, getSelector, SelectorBuilder, properties);
    addCustomMethods(obj, getSelector, SelectorBuilder, customMethods);

    obj.getStyleProperty = prop => {
        const callsite = getCallsiteForMethod('getStyleProperty');

        return ReExecutablePromise.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.style ? snapshot.style[prop] : void 0;
        });
    };

    obj.getAttribute = attrName => {
        const callsite = getCallsiteForMethod('getAttribute');

        return ReExecutablePromise.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.attributes ? snapshot.attributes[attrName] : void 0;
        });
    };

    obj.hasAttribute = attrName => {
        const callsite = getCallsiteForMethod('hasAttribute');

        return ReExecutablePromise.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.attributes ? snapshot.attributes.hasOwnProperty(attrName) : false;
        });
    };

    obj.getBoundingClientRectProperty = prop => {
        const callsite = getCallsiteForMethod('getBoundingClientRectProperty');

        return ReExecutablePromise.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.boundingClientRect ? snapshot.boundingClientRect[prop] : void 0;
        });
    };

    obj.hasClass = name => {
        const callsite = getCallsiteForMethod('hasClass');

        return ReExecutablePromise.fromFn(async () => {
            const snapshot = await getSnapshot(getSelector, callsite, SelectorBuilder);

            return snapshot.classNames ? snapshot.classNames.indexOf(name) > -1 : false;
        });
    };
}

function createCounter (getSelector, SelectorBuilder) {
    const builder  = new SelectorBuilder(getSelector(), { counterMode: true }, { instantiation: 'Selector' });
    const counter  = builder.getFunction();
    const callsite = getCallsiteForMethod('get');

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
            const counter = createCounter(getSelector, SelectorBuilder);

            return ReExecutablePromise.fromFn(() => counter());
        }
    });

    Object.defineProperty(obj, 'exists', {
        get: () => {
            const counter = createCounter(getSelector, SelectorBuilder);

            return ReExecutablePromise.fromFn(async () => await counter() > 0);
        }
    });
}

function convertFilterToClientFunctionIfNecessary (callsiteName, filter, dependencies) {
    if (typeof filter === 'function') {
        const builder = filter[clientFunctionBuilderSymbol];
        const fn      = builder ? builder.fn : filter;
        const options = builder ? assign({}, builder.options, { dependencies }) : { dependencies };

        return (new ClientFunctionBuilder(fn, options, { instantiation: callsiteName })).getFunction();
    }

    return filter;
}

function createDerivativeSelectorWithFilter (getSelector, SelectorBuilder, selectorFn, filter, additionalDependencies) {
    const collectionModeSelectorBuilder = new SelectorBuilder(getSelector(), { collectionMode: true });
    const customDOMProperties           = collectionModeSelectorBuilder.options.customDOMProperties;
    const customMethods                 = collectionModeSelectorBuilder.options.customMethods;

    let dependencies = {
        selector:    collectionModeSelectorBuilder.getFunction(),
        filter:      filter,
        filterNodes: filterNodes
    };

    const { boundTestRun, timeout, visibilityCheck, apiFnChain } = collectionModeSelectorBuilder.options;

    dependencies = assign(dependencies, additionalDependencies);

    const builder = new SelectorBuilder(selectorFn, {
        dependencies,
        customDOMProperties,
        customMethods,
        boundTestRun,
        timeout,
        visibilityCheck,
        apiFnChain,
        apiFn
    }, { instantiation: 'Selector' });

    return builder.getFunction();
}

const filterByText = convertFilterToClientFunctionIfNecessary('filter', selectorTextFilter);
const filterByAttr = convertFilterToClientFunctionIfNecessary('filter', selectorAttributeFilter);

function ensureRegExpContext (str) {
    // NOTE: if a regexp is created in a separate context (via the 'vm' module) we
    // should wrap it with new RegExp() to make the `instanceof RegExp` check successful.
    if (typeof str !== 'string' && !(str instanceof RegExp))
        return new RegExp(str);

    return str;
}

function wrapApiChainFunction (obj, fn) {
    const originalFn = obj[fn];

    const prepareApiFnArgs = function (args) {
        args = args.map(arg => {
            if (typeof arg === 'string')
                return `'${arg}'`;
            if (typeof arg === 'function')
                return '[function]';
            return arg;
        });
        args = args.join(', ');

        return `.${fn}(${args})`;
    };

    obj[fn] = function (...args) {
        apiFn = prepareApiFnArgs(args);

        return originalFn.apply(obj, args);
    };
}

function addFilterMethods (obj, getSelector, SelectorBuilder) {
    obj.nth = index => {
        assertType(is.number, 'nth', '"index" argument', index);

        const builder = new SelectorBuilder(getSelector(), { index, apiFn }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.withText = text => {
        assertType([is.string, is.regExp], 'withText', '"text" argument', text);

        text = ensureRegExpContext(text);

        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();

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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();

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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();

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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            const nodes = selector();

            if (!nodes.length)
                return null;

            return filterNodes(nodes, filter, document, void 0);
            /* eslint-enable no-undef */
        };

        return createDerivativeSelectorWithFilter(getSelector, SelectorBuilder, selectorFn, filter);
    };

    obj.filterVisible = () => {
        const builder = new SelectorBuilder(getSelector(), { filterVisible: true, apiFn }, { instantiation: 'Selector' });

        return builder.getFunction();
    };

    obj.filterHidden = () => {
        const builder = new SelectorBuilder(getSelector(), { filterHidden: true, apiFn }, { instantiation: 'Selector' });

        return builder.getFunction();
    };
}

function addCustomDOMPropertiesMethod (obj, getSelector, SelectorBuilder) {
    obj.addCustomDOMProperties = customDOMProperties => {
        assertAddCustomDOMPropertiesOptions(customDOMProperties);

        const builder = new SelectorBuilder(getSelector(), { customDOMProperties }, { instantiation: 'Selector' });

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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                if (typeof filter === 'string') {
                    return typeof node.querySelectorAll === 'function' ?
                        node.querySelectorAll(filter) :
                        null;
                }

                const results = [];

                const visitNode = currentNode => {
                    const cnLength = currentNode.childNodes.length;

                    for (let i = 0; i < cnLength; i++) {
                        const child = currentNode.childNodes[i];

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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parents = [];

                for (let parent = node.parentNode; parent; parent = parent.parentNode)
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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const childElements = [];
                const cnLength      = node.childNodes.length;

                for (let i = 0; i < cnLength; i++) {
                    const child = node.childNodes[i];

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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;

                if (!parent)
                    return null;

                const siblings = [];
                const cnLength = parent.childNodes.length;

                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];

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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;

                if (!parent)
                    return null;

                const siblings = [];
                const cnLength = parent.childNodes.length;
                let afterNode  = false;

                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];

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

        const selectorFn = () => {
            /* eslint-disable no-undef */
            return expandSelectorResults(selector, node => {
                const parent = node.parentNode;

                if (!parent)
                    return null;

                const siblings = [];
                const cnLength = parent.childNodes.length;

                for (let i = 0; i < cnLength; i++) {
                    const child = parent.childNodes[i];

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

export function addAPI (selector, getSelector, SelectorBuilder, customDOMProperties, customMethods) {
    addSnapshotPropertyShorthands(selector, getSelector, SelectorBuilder, customDOMProperties, customMethods);
    addCustomDOMPropertiesMethod(selector, getSelector, SelectorBuilder);
    addCustomMethodsMethod(selector, getSelector, SelectorBuilder);
    addCounterProperties(selector, getSelector, SelectorBuilder);

    const obj = {};

    addFilterMethods(obj, getSelector, SelectorBuilder);
    addHierarchicalSelectors(obj, getSelector, SelectorBuilder);

    Object.keys(obj).forEach(fnName => {
        wrapApiChainFunction(obj, fnName);
    });

    Object.assign(selector, obj);
}
