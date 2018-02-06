import { InvalidSelectorResultError } from '../../../../../errors/test-run';
import { exists, visible } from '../element-utils';
import testCafeCore from '../../../deps/testcafe-core';
import hammerhead from '../../../deps/hammerhead';

// NOTE: save original ctors and methods because they may be overwritten by page code
var isArray        = Array.isArray;
var Node           = window.Node;
var HTMLCollection = window.HTMLCollection;
var NodeList       = window.NodeList;
var arrayUtils     = testCafeCore.arrayUtils;

function isArrayOfNodes (obj) {
    if (!isArray(obj))
        return false;

    for (var i = 0; i < obj.length; i++) {
        if (!(obj[i] instanceof Node))
            return false;
    }

    return true;
}

function getNodeByIndex (collection, index) {
    return index < 0 ? collection[collection.length + index] : collection[index];
}


// Selector filter
hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeSelectorFilter%', {
    value: (node, options) => {
        var filtered = [];

        if (node === null || node === void 0)
            filtered = [];

        else if (node instanceof Node)
            filtered = [node];

        else if (node instanceof HTMLCollection || node instanceof NodeList || isArrayOfNodes(node))
            filtered = node;

        else
            throw new InvalidSelectorResultError();

        filtered = arrayUtils.filter(filtered, n => exists(n));

        if (options.filterVisible)
            filtered = filtered.filter(n => visible(n));

        if (options.filterHidden)
            filtered = filtered.filter(n => !visible(n));

        if (options.counterMode) {
            if (options.index !== null)
                return getNodeByIndex(filtered, options.index) ? 1 : 0;

            return filtered.length;
        }

        if (options.collectionMode) {
            if (options.index !== null) {
                var nodeOnIndex = getNodeByIndex(filtered, options.index);

                return nodeOnIndex ? [nodeOnIndex] : [];
            }

            return filtered;
        }

        return getNodeByIndex(filtered, options.index || 0);
    },
    configurable: true
});
