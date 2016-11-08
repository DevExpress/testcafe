import { ELEMENT_SNAPSHOT_PROPERTIES, NODE_SNAPSHOT_PROPERTIES } from './snapshot-properties';
import { CantObtainInfoForElementSpecifiedBySelectorError } from '../../errors/test-run';
import { getCallsite, getCallsiteForGetter } from '../../errors/callsite';
import {
    assertStringOrRegExp,
    assertNonNegativeNumber,
    assertFunctionOrString
} from '../../errors/runtime/type-assertions';

const SNAPSHOT_PROPERTIES = NODE_SNAPSHOT_PROPERTIES.concat(ELEMENT_SNAPSHOT_PROPERTIES);


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
                var callsite = getCallsiteForGetter();
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
}

export default function addAPI (obj, getSelector, SelectorBuilder) {
    addSnapshotPropertyShorthands(obj, getSelector);
    addFilterMethods(obj, getSelector, SelectorBuilder);
    addHierachicalSelectors(obj, getSelector, SelectorBuilder);
}
