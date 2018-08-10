import { InvalidSelectorResultError } from '../../../../../errors/test-run';
import { exists, visible } from '../element-utils';
import testCafeCore from '../../../deps/testcafe-core';
import hammerhead from '../../../deps/hammerhead';

// NOTE: save original ctors and methods because they may be overwritten by page code
const isArray        = Array.isArray;
const Node           = window.Node;
const HTMLCollection = window.HTMLCollection;
const NodeList       = window.NodeList;
const arrayUtils     = testCafeCore.arrayUtils;

const SELECTOR_FILTER_ERROR = {
    filterVisible: 1,
    filterHidden:  2,
    nth:           3
};

const FILTER_ERROR_TO_API_RE = { };

FILTER_ERROR_TO_API_RE[SELECTOR_FILTER_ERROR.filterVisible] = /^\.filterVisible\(\)$/;
FILTER_ERROR_TO_API_RE[SELECTOR_FILTER_ERROR.filterHidden]  = /^\.filterHidden\(\)$/;
FILTER_ERROR_TO_API_RE[SELECTOR_FILTER_ERROR.nth]           = /^\.nth\(\d+\)$/;

class SelectorFilter {
    constructor () {
        this.err = null;
    }
    get error () {
        return this.err;
    }
    set error (message) {
        if (this.err === null)
            this.err = message;
    }
    filter (node, options, apiInfo) {
        let filtered = arrayUtils.filter(node, n => exists(n));

        if (options.filterVisible) {
            filtered = filtered.filter(n => visible(n));

            this.assertFilterError(filtered, apiInfo, SELECTOR_FILTER_ERROR.filterVisible);
        }

        if (options.filterHidden) {
            filtered = filtered.filter(n => !visible(n));

            this.assertFilterError(filtered, apiInfo, SELECTOR_FILTER_ERROR.filterHidden);
        }

        if (options.counterMode) {
            if (options.index !== null)
                filtered = this.getNodeByIndex(filtered, options.index) ? 1 : 0;
            else
                filtered = filtered.length;
        }
        else if (options.collectionMode) {
            if (options.index !== null) {
                const nodeOnIndex = this.getNodeByIndex(filtered, options.index);

                filtered = nodeOnIndex ? [nodeOnIndex] : [];
            }
        }
        else {
            filtered = this.getNodeByIndex(filtered, options.index || 0);

            if (typeof options.index === 'number')
                this.assertFilterError(filtered, apiInfo, SELECTOR_FILTER_ERROR.nth);
        }

        return filtered;
    }
    cast (node) {
        let result = null;

        if (hammerhead.utils.types.isNullOrUndefined(node))
            result = [];

        else if (node instanceof Node)
            result = [node];

        else if (node instanceof HTMLCollection || node instanceof NodeList || this.isArrayOfNodes(node))
            result = node;

        else
            throw new InvalidSelectorResultError();

        return result;
    }
    assertFilterError (filtered, apiInfo, filterError) {
        if (!filtered || filtered.length === 0)
            this.error = this.getErrorItem(apiInfo, filterError);
    }
    getErrorItem ({ apiFnChain, apiFnID }, err) {
        if (err) {
            for (let i = apiFnID; i < apiFnChain.length; i++) {
                if (FILTER_ERROR_TO_API_RE[err].test(apiFnChain[i]))
                    return i;
            }
        }
        return null;
    }
    isArrayOfNodes (obj) {
        if (!isArray(obj))
            return false;

        for (let i = 0; i < obj.length; i++) {
            if (!(obj[i] instanceof Node))
                return false;
        }

        return true;
    }
    getNodeByIndex (collection, index) {
        return index < 0 ? collection[collection.length + index] : collection[index];
    }
}

// Selector filter
hammerhead.nativeMethods.objectDefineProperty.call(window, window, '%testCafeSelectorFilter%', {
    value:        new SelectorFilter(),
    configurable: true
});
