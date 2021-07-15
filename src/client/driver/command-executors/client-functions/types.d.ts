import { Dictionary } from '../../../../configuration/interfaces';
import { SelectorErrorBase } from '../../../../shared/errors/index';
import SelectorFilter from './selector-executor/filter';

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
    filter: SelectorFilter;
    filterOptions: FilterOptions;
    apiInfo: APIInfo;
    boundArgs: unknown[];
    customDOMProperties: CustomDOMProperties;
}

type SelectorErrorCb = (fn: FnInfo | null) => SelectorErrorBase;

export interface NativeMethods {
    Function: typeof Function;
    Node: typeof Node;
    objectKeys: ObjectConstructor['keys'];
    Promise: typeof Promise;
    dateNow: DateConstructor['now'];
    isArray: ArrayConstructor['isArray'];
    NodeList: typeof NodeList;
    HTMLCollection: typeof HTMLCollection;
}

export interface ClientFunctionAdapter {
    isProxyless: boolean;
    nativeMethods: NativeMethods;
    PromiseCtor: typeof Promise;
    delay (ms: number): Promise<void>;
    isShadowRoot (el: Node): boolean;
    isDomElement (el: unknown): boolean;
    isTextNode (el: unknown): boolean;
    isOptionElement (el: unknown): boolean;
    getTagName (el: Node): string;
    isOptionElementVisible (el: Node): boolean;
    isElementVisible (el: Node): boolean;
    getActiveElement (): Node;
}
