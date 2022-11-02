import { InvalidSelectorResultError } from '../../../../../shared/errors/index';
import {
    isNodeCollection,
    isArrayOfNodes,
    castToArray,
} from './utils';
import { APIInfo, FilterOptions } from '../types';
// @ts-ignore
import { nativeMethods } from '../../../deps/hammerhead';
// @ts-ignore
import { positionUtils } from '../../../deps/testcafe-core';


const SELECTOR_FILTER_ERROR = {
    filterVisible: 1,
    filterHidden:  2,
    nth:           3,
};

const FILTER_ERROR_TO_API_RE = {
    [SELECTOR_FILTER_ERROR.filterVisible]: /^\.filterVisible\(\)$/,
    [SELECTOR_FILTER_ERROR.filterHidden]:  /^\.filterHidden\(\)$/,
    [SELECTOR_FILTER_ERROR.nth]:           /^\.nth\(\d+\)$/,
};


class SelectorFilter {
    private _err: number | null = null;

    public get error (): number | null {
        return this._err;
    }

    public set error (message: number | null) {
        if (this._err === null)
            this._err = message;
    }

    public filter (nodes: Node[], options: FilterOptions, apiInfo: APIInfo): number | Node | Node[] | undefined {
        if (options.filterVisible) {
            nodes = nodes.filter(positionUtils.isElementVisible);

            this._assertFilterError(nodes, apiInfo, SELECTOR_FILTER_ERROR.filterVisible);
        }

        if (options.filterHidden) {
            nodes = nodes.filter(n => !positionUtils.isElementVisible(n));

            this._assertFilterError(nodes, apiInfo, SELECTOR_FILTER_ERROR.filterHidden);
        }

        if (options.counterMode) {
            if (options.index === null)
                return nodes.length;

            return SelectorFilter._getNodeByIndex(nodes, options.index) ? 1 : 0;
        }

        if (options.collectionMode) {
            if (options.index !== null) {
                const nodeOnIndex = SelectorFilter._getNodeByIndex(nodes, options.index);

                nodes = nodeOnIndex ? [nodeOnIndex] : [];

                this._assertFilterError(nodes, apiInfo, SELECTOR_FILTER_ERROR.nth);
            }

            return nodes;
        }

        const nodeOnIndex = SelectorFilter._getNodeByIndex(nodes, options.index || 0);

        if (!nodeOnIndex)
            this.error = SelectorFilter._getErrorItem(apiInfo, SELECTOR_FILTER_ERROR.nth);

        return nodeOnIndex;
    }

    public cast (searchResult: unknown): Node[] {
        if (searchResult === null || searchResult === void 0)
            return [];

        else if (searchResult instanceof nativeMethods.Node)
            return [searchResult as Node];

        else if (isArrayOfNodes(searchResult))
            return searchResult;

        else if (isNodeCollection(searchResult))
            return castToArray(searchResult);

        throw new InvalidSelectorResultError();
    }

    private _assertFilterError (filtered: Node[], apiInfo: APIInfo, filterError: number): void {
        if (filtered.length === 0)
            this.error = SelectorFilter._getErrorItem(apiInfo, filterError);
    }

    private static _getErrorItem ({ apiFnChain, apiFnID }: APIInfo, err: number): number | null {
        if (err) {
            for (let i = apiFnID; i < apiFnChain.length; i++) {
                if (FILTER_ERROR_TO_API_RE[err].test(apiFnChain[i]))
                    return i;
            }
        }

        return null;
    }

    private static _getNodeByIndex (nodes: Node[], index: number): Node | undefined {
        return index < 0 ? nodes[nodes.length + index] : nodes[index];
    }
}

export default new SelectorFilter();
