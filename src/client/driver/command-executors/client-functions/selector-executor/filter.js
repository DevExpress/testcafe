import { InvalidSelectorResultError } from '../../../../../errors/test-run';
import { exists, visible, IsNodeCollection } from '../../../utils/element-utils';
import testCafeCore from '../../../deps/testcafe-core';
import hammerhead from '../../../deps/hammerhead';

const arrayUtils     = testCafeCore.arrayUtils;
const typeUtils      = hammerhead.utils.types;
const nativeMethods  = hammerhead.nativeMethods;

const SELECTOR_FILTER_ERROR = {
    filterVisible: 1,
    filterHidden:  2,
    nth:           3
};

const FILTER_ERROR_TO_API_RE = {
    [SELECTOR_FILTER_ERROR.filterVisible]: /^\.filterVisible\(\)$/,
    [SELECTOR_FILTER_ERROR.filterHidden]:  /^\.filterHidden\(\)$/,
    [SELECTOR_FILTER_ERROR.nth]:           /^\.nth\(\d+\)$/
};

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
        let filtered = arrayUtils.filter(node, exists);

        if (options.filterVisible) {
            filtered = filtered.filter(visible);

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
        else {
            if (options.collectionMode) {
                if (options.index !== null) {
                    const nodeOnIndex = this.getNodeByIndex(filtered, options.index);

                    filtered = nodeOnIndex ? [nodeOnIndex] : [];
                }
            }
            else
                filtered = this.getNodeByIndex(filtered, options.index || 0);

            if (typeof options.index === 'number')
                this.assertFilterError(filtered, apiInfo, SELECTOR_FILTER_ERROR.nth);
        }

        return filtered;
    }

    cast (node) {
        let result = null;

        if (typeUtils.isNullOrUndefined(node))
            result = [];

        else if (node instanceof Node)
            result = [node];

        else if (IsNodeCollection(node))
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

    getNodeByIndex (collection, index) {
        return index < 0 ? collection[collection.length + index] : collection[index];
    }
}

// Selector filter
nativeMethods.objectDefineProperty.call(window, window, '%testCafeSelectorFilter%', {
    value:        new SelectorFilter(),
    configurable: true
});
