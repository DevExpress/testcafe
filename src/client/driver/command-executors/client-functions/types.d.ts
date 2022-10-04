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

export interface SelectorErrorParams {
    apiFnChain: string[];
    apiFnIndex: number | null;
    reason: string | null;
}

type CustomDOMProperties = Dictionary<(n: Node) => unknown>;

export interface SelectorDependencies extends Dictionary<unknown> {
    selectorFilter: typeof selectorFilter;
    filterOptions: FilterOptions;
    apiInfo: APIInfo;
    boundArgs?: unknown[];
    customDOMProperties?: CustomDOMProperties;
}

type SelectorErrorCb = (fn: SelectorErrorParams | null) => SelectorErrorBase;

export interface NativeMethods {
    Function: typeof Function;
    Node: typeof Node;
    objectKeys: ObjectConstructor['keys'];
    objectAssign: ObjectConstructor['assign'];
    objectGetPrototypeOf: ObjectConstructor['getPrototypeOf'];
    objectToString: Object['toString']; // eslint-disable-line @typescript-eslint/ban-types, no-restricted-globals
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
    contentWindowGetter: () => HTMLIFrameElement['contentWindow'];
    scrollTo: Window['scrollTo'];
}

