import { ELEMENT_SNAPSHOT_PROPERTIES, NODE_SNAPSHOT_PROPERTIES } from './node-snapshot-properties';
import { CantObtainInfoForElementSpecifiedBySelectorError } from '../../errors/test-run';
import { getCallsite, getCallsiteForGetter } from '../../errors/callsite';

const SNAPSHOT_PROPERTIES = NODE_SNAPSHOT_PROPERTIES.concat(ELEMENT_SNAPSHOT_PROPERTIES);

async function getSnapshot (selector, callsite) {
    var node = null;

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

export default function createSnapshotPropertyShorthands (obj, selector) {
    SNAPSHOT_PROPERTIES.forEach(prop => {
        Object.defineProperty(obj, prop, {
            get: async () => {
                var callsite = getCallsiteForGetter();
                var snapshot = await getSnapshot(selector, callsite);

                return snapshot[prop];
            }
        });
    });

    obj.getStyleProperty = async prop => {
        var callsite = getCallsite('getStyleProperty');
        var snapshot = await getSnapshot(selector, callsite);

        return snapshot.style[prop];
    };

    obj.getAttribute = async attrName => {
        var callsite = getCallsite('getAttribute');
        var snapshot = await getSnapshot(selector, callsite);

        return snapshot.attributes[attrName];
    };

    obj.getBoundingClientRectProperty = async prop => {
        var callsite = getCallsite('getBoundingClientRectProperty');
        var snapshot = await getSnapshot(selector, callsite);

        return snapshot.boundingClientRect[prop];
    };

    obj.hasClass = async name => {
        var callsite = getCallsite('hasClass');
        var snapshot = await getSnapshot(selector, callsite);

        return snapshot.classNames ? snapshot.classNames.indexOf(name) > -1 : false;
    };
}
