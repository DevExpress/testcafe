import { Dictionary } from '../../../../../configuration/interfaces';
import { SelectorErrorBase } from '../../../../../shared/errors/index';

export interface FilterOptions {
    filterVisible: boolean;
    filterHidden: boolean;
    counterMode: boolean;
    collectionMode: boolean;
    index: number | null;
    getVisibleValueMode: boolean;
}

export interface APIInfo {
    apiFnChain: (string | number)[];
    apiFnID: number;
}

export interface FnInfo {
    apiFnChain: string[];
    apiFnIndex: number;
}

type CustomDOMProperties = Dictionary<(n: Node) => unknown>;

export interface SelectorDependencies extends Dictionary<unknown> {
    filterOptions: FilterOptions;
    apiInfo: APIInfo;
    boundArgs: unknown[];
    customDOMProperties: CustomDOMProperties;
}

type SelectorErrorCb = (fn: FnInfo | null) => SelectorErrorBase;
