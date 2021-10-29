import { Dictionary } from '../../../../configuration/interfaces';
import { SelectorErrorBase } from '../../../../shared/errors/index';
import selectorFilter from './selector-executor/filter';

export interface FilterOptions {
    filterVisible: boolean;
    filterHidden: boolean;
    counterMode: boolean;
    collectionMode: boolean;
    index: number | null;
    getVisibleValueMode: boolean;
}

export interface APIInfo {
    apiFnChain: string[];
    apiFnID: number;
}

export interface FnInfo {
    apiFnChain: string[];
    apiFnIndex: number | null;
}

type CustomDOMProperties = Dictionary<(n: Node) => unknown>;

export interface SelectorDependencies extends Dictionary<unknown> {
    selectorFilter: typeof selectorFilter;
    filterOptions: FilterOptions;
    apiInfo: APIInfo;
    boundArgs?: unknown[];
    customDOMProperties?: CustomDOMProperties;
}

type SelectorErrorCb = (fn: FnInfo | null) => SelectorErrorBase;

export interface NativeMethods {
    Function: typeof Function;
    Node: typeof Node;
    objectKeys: ObjectConstructor['keys'];
    objectAssign: ObjectConstructor['assign'];
    objectGetPrototypeOf: ObjectConstructor['getPrototypeOf'];
    objectToString: Object['toString']; // eslint-disable-line @typescript-eslint/ban-types
    Promise: typeof Promise;
    dateNow: DateConstructor['now'];
    isArray: ArrayConstructor['isArray'];
    arrayFilter: any[]['filter'];
    NodeList: typeof NodeList;
    HTMLCollection: typeof HTMLCollection;
    setTimeout: Window['setTimeout'];
    elementClass: typeof Element;
    svgElementClass: typeof SVGElement;
    closest: Element['closest'];
    matches: Element['matches'];
    getAttribute: Element['getAttribute'];
    querySelector: HTMLElement['querySelector'];
    querySelectorAll: HTMLElement['querySelectorAll'];
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
    getTagName (el: Element): string;
    isOptionElementVisible (el: Node): boolean;
    isElementVisible (el: Node): boolean;
    getActiveElement (): Node;
}
