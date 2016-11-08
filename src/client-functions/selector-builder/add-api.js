import { ELEMENT_SNAPSHOT_PROPERTIES, NODE_SNAPSHOT_PROPERTIES } from './snapshot-properties';
import { CantObtainInfoForElementSpecifiedBySelectorError } from '../../errors/test-run';
import getCallsite from '../../errors/get-callsite';
import ClientFunctionBuilder from '../client-function-builder';
import {
    assertStringOrRegExp,
    assertNonNegativeNumber,
    assertFunctionOrString,
    assertFunctionOrStringOnNonNegativeNumber
} from '../../errors/runtime/type-assertions';

const SNAPSHOT_PROPERTIES = NODE_SNAPSHOT_PROPERTIES.concat(ELEMENT_SNAPSHOT_PROPERTIES);


var filterNodes = (new ClientFunctionBuilder((nodes, filter, querySelectorRoot) => {
    if (typeof filter === 'number')
        return nodes[filter];

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
            get: async () => {
                var callsite = getCallsite('get');
                var snapshot = await getSnapshot(getSelector, callsite);

                return snapshot[prop];
            }
        });
    });

    obj.getStyleProperty = async prop => {
        var callsite = getCallsite('getStyleProperty');
        var snapshot = await getSnapshot(getSelector, callsite);

        return snapshot.style ? snapshot.style[prop] : void 0;
    };

    obj.getAttribute = async attrName => {
        var callsite = getCallsite('getAttribute');
        var snapshot = await getSnapshot(getSelector, callsite);

        return snapshot.attributes ? snapshot.attributes[attrName] : void 0;
    };

    obj.getBoundingClientRectProperty = async prop => {
        var callsite = getCallsite('getBoundingClientRectProperty');
        var snapshot = await getSnapshot(getSelector, callsite);

        return snapshot.boundingClientRect ? snapshot.boundingClientRect[prop] : void 0;
    };

    obj.hasClass = async name => {
        var callsite = getCallsite('hasClass');
        var snapshot = await getSnapshot(getSelector, callsite);

        return snapshot.classNames ? snapshot.classNames.indexOf(name) > -1 : false;
    };
}

function addFilterMethods (obj, getSelector, SelectorBuilder) {
    obj.nth = index => {
        assertNonNegativeNumber('nth', '"index" argument', index);

        var builder = new SelectorBuilder(getSelector(), { index: index });

        return builder.getFunction();
    };

    obj.withText = text => {
        assertStringOrRegExp('withText', '"text" argument', text);

        var builder = new SelectorBuilder(getSelector(), { text: text });

        return builder.getFunction();
    };
}

function addHierachicalSelectors (obj, getSelector, SelectorBuilder) {
    // Find
    obj.find = filter => {
        assertFunctionOrString('find', '"filter" argument', filter);

        var builderOptions = {
            dependencies: {
                selector: getSelector(),
                filter:   filter
            }
        };

        var builder = new SelectorBuilder(() => {
            /* eslint-disable no-undef */
            var node = selector();

            if (!node)
                return null;

            if (typeof filter === 'string') {
                return typeof node.querySelectorAll === 'function' ?
                       node.querySelectorAll(filter) :
                       null;
            }

            var result = [];

            var visitNode = currentNode => {
                var cnLength = currentNode.childNodes.length;

                for (var i = 0; i < cnLength; i++) {
                    var child = currentNode.childNodes[i];

                    if (filter(child))
                        result.push(child);

                    visitNode(child);
                }
            };

            visitNode(node);

            return result;
            /* eslint-enable no-undef */
        }, builderOptions);

        return builder.getFunction();
    };

    // Parent
    obj.parent = filter => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('parent', '"filter" argument', filter);

        var builderOptions = {
            dependencies: {
                selector:    getSelector(),
                filter:      filter,
                filterNodes: filterNodes
            }
        };

        var builder = new SelectorBuilder(() => {
            /* eslint-disable no-undef */
            var node = selector();

            if (!node)
                return null;

            var parents = [];

            for (node = node.parentNode; node; node = node.parentNode)
                parents.push(node);

            return filter ? filterNodes(parents, filter, document) : parents;
            /* eslint-enable no-undef */
        }, builderOptions);

        return builder.getFunction();
    };

    // Child
    obj.child = filter => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('child', '"filter" argument', filter);

        var builderOptions = {
            dependencies: {
                selector:    getSelector(),
                filter:      filter,
                filterNodes: filterNodes
            }
        };

        var builder = new SelectorBuilder(() => {
            /* eslint-disable no-undef */
            var node = selector();

            if (!node)
                return null;

            var childElements = [];
            var cnLength      = node.childNodes.length;

            for (var i = 0; i < cnLength; i++) {
                var child = node.childNodes[i];

                if (child.nodeType === 1)
                    childElements.push(child);
            }

            return filter ? filterNodes(childElements, filter, node) : childElements;
            /* eslint-enable no-undef */
        }, builderOptions);

        return builder.getFunction();
    };

    // Sibling
    obj.sibling = filter => {
        if (filter !== void 0)
            assertFunctionOrStringOnNonNegativeNumber('sibling', '"filter" argument', filter);

        var builderOptions = {
            dependencies: {
                selector:    getSelector(),
                filter:      filter,
                filterNodes: filterNodes
            }
        };

        var builder = new SelectorBuilder(() => {
            /* eslint-disable no-undef */
            var node   = selector();
            var parent = node && node.parentNode;

            if (!parent)
                return null;

            var siblings = [];
            var cnLength = parent.childNodes.length;

            for (var i = 0; i < cnLength; i++) {
                var child = parent.childNodes[i];

                if (child.nodeType === 1 && child !== node)
                    siblings.push(child);
            }

            return filter ? filterNodes(siblings, filter, parent) : siblings;
            /* eslint-enable no-undef */
        }, builderOptions);

        return builder.getFunction();
    };
}

function createCounter (getSelector, SelectorBuilder) {
    var builder = new SelectorBuilder(getSelector(), { counterMode: true }, {
        instantiation: 'Selector',
        execution:     'get'
    });

    return builder.getFunction();
}

function addCounterProperties (obj, getSelector, SelectorBuilder) {
    Object.defineProperty(obj, 'count', {
        get: () => {
            var counter = createCounter(getSelector, SelectorBuilder);

            return counter();
        }
    });

    Object.defineProperty(obj, 'exists', {
        get: async () => {
            var counter = createCounter(getSelector, SelectorBuilder);

            return await counter() > 0;
        }
    });
}

export default function addAPI (obj, getSelector, SelectorBuilder) {
    addSnapshotPropertyShorthands(obj, getSelector);
    addFilterMethods(obj, getSelector, SelectorBuilder);
    addHierachicalSelectors(obj, getSelector, SelectorBuilder);
    addCounterProperties(obj, getSelector, SelectorBuilder);
}
