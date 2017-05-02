// Options
//----------------------------------------------------------------------------
interface KeyModifiers {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean
}

interface ActionOptions {
    speed?: number;
}

interface MouseOptions extends ActionOptions {
    offsetX?: number;
    offsetY?: number;
    modifiers?: KeyModifiers;
}

interface ClickOptions extends MouseOptions {
    caretPos?: number;
}

interface TypeOptions extends ClickOptions {
    replace?: boolean;
    paste?: boolean;
}


// ClientFunction
//----------------------------------------------------------------------------
interface ClientFunctionOptions {
    dependencies?: {[key: string]: Function},
    boundTestRun: TestController
}

interface ClientFunction {
    (...args: any[]): Promise<any>;
    with(options: ClientFunctionOptions): ClientFunction;
}

// NodeSnapshot
//----------------------------------------------------------------------------
interface TextRectangle {
    bottom: number;
    left: number;
    right: number;
    top: number;
    width: number;
    height: number;
}

interface NodeSnapshotProperties {
    childElementCount: number;
    childNodeCount: number;
    hasChildElements: boolean;
    hasChildNodes: boolean;
    nodeType: number;
    textContent: string;

    attributes?: {[name: string]: string};
    boundingClientRect?: TextRectangle;
    checked?: boolean | undefined;
    classNames?: string[];
    clientHeight?: number;
    clientLeft?: number;
    clientTop?: number;
    clientWidth?: number;
    focused?: boolean;
    id?: string;
    innerText?: string;
    namespaceURI?: string | null;
    offsetHeight?: number;
    offsetLeft?: number;
    offsetTop?: number;
    offsetWidth?: number;
    selected?: boolean | undefined;
    selectedIndex?: number | undefined;
    scrollHeight?: number;
    scrollLeft?: number;
    scrollTop?: number;
    scrollWidth?: number;
    style?: {[prop: string]: string};
    tagName?: string;
    value?: string | undefined;
    visible?: boolean;
}

interface NodeSnapshot extends NodeSnapshotProperties {
    hasClass?(className: string): boolean;
    getStyleProperty?(propertyName: string): string;
    getAttribute?(attributeName: string): string;
    getBoundingClientRectProperty?(propertyName: string): number;
    hasAttribute?(attributeName: string): boolean;
}

// Selectors
//----------------------------------------------------------------------------
interface SelectorOptions {
    boundTestRun?: TestController;
    timeout?: number;
    visibilityCheck?: boolean;
}

type AsyncNodeSnapshotProperties = { [P in keyof NodeSnapshotProperties]: Promise<NodeSnapshotProperties[P]> };

interface SelectorAPI extends AsyncNodeSnapshotProperties {
    nth(index: number): SelectorPromise;

    withText(text: string): SelectorPromise;
    withText(re: RegExp): SelectorPromise;

    withAttribute(attrName: string, attrValue?: string): SelectorPromise;

    filter(cssSelector: string): SelectorPromise;
    filter(filterFn: (node: Element | Node, idx: number) => boolean, dependencies?: {[key: string]: Function}): SelectorPromise;

    find(cssSelector: string): SelectorPromise;
    find(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => boolean, dependencies?: {[key: string]: Function}): SelectorPromise;

    parent(): SelectorPromise;
    parent(index: number): SelectorPromise;
    parent(cssSelector: string): SelectorPromise;
    parent(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => boolean, dependencies?: {[key: string]: Function}): SelectorPromise;

    child(): SelectorPromise;
    child(index: number): SelectorPromise;
    child(cssSelector: string): SelectorPromise;
    child(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => boolean, dependencies?: {[key: string]: Function}): SelectorPromise;

    sibling(): SelectorPromise;
    sibling(index: number): SelectorPromise;
    sibling(cssSelector: string): SelectorPromise;
    sibling(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => boolean, dependencies?: {[key: string]: Function}): SelectorPromise;

    nextSibling(): SelectorPromise;
    nextSibling(index: number): SelectorPromise;
    nextSibling(cssSelector: string): SelectorPromise;
    nextSibling(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => boolean, dependencies?: {[key: string]: Function}): SelectorPromise;

    prevSibling(): SelectorPromise;
    prevSibling(index: number): SelectorPromise;
    prevSibling(cssSelector: string): SelectorPromise;
    prevSibling(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => boolean, dependencies?: {[key: string]: Function}): SelectorPromise;

    exists: Promise<boolean>;
    count: Promise<number>;

    addCustomDOMProperties(props: {[prop: string]: (node: Element | Node) => any}): Selector;
    addCustomMethods(methods: {[method: string]: (node: Element | Node, ...methodParams: any[]) => any}): Selector;

    hasClass(className: string): Promise<boolean>;
    getStyleProperty(propertyName: string): Promise<string>;
    getAttribute(attributeName: string): Promise<string>;
    getBoundingClientRectProperty(propertyName: string): Promise<number>;
    hasAttribute(attributeName: string): Promise<boolean>;
}

interface Selector extends SelectorAPI {
    (...args: any[]): SelectorPromise;
}

interface SelectorPromise extends SelectorAPI, Promise<NodeSnapshot> {
}


// Role
//----------------------------------------------------------------------------
declare class Role {
    private constructor();
}


interface RoleOptions {
    preseveUrl?: boolean;
}


// TestController
//----------------------------------------------------------------------------
interface TestController {
    ctx: {[key: string]: any};
    readonly fixtureCtx: {[key: string]: any};
}


// Exportable lib
declare module 'testcafe' {
    export function Selector(init: string | (() => Node | Node[] | NodeList | HTMLCollection) | Selector | NodeSnapshot | SelectorPromise, options?: SelectorOptions): Selector;

    export function ClientFunction(fn: Function, options?: ClientFunctionOptions): ClientFunction;

    export var Role: {
        (url: String, fn: (t: TestController) => Promise<any>, options?: RoleOptions): Role;
        anonymous(): Role;
    };
}


// Structure
//----------------------------------------------------------------------------
interface HTTPAuthCredentials {
    username: string,
    password: string,
    domain?: string,
    workstation?: string
}

interface FixtureFn {
    (name: string): this;
    page(name: string): this;
    httpAuth(credentials: HTTPAuthCredentials): this;
    before(fn: () => Promise<any>): this;
    after(fn: () => Promise<any>): this;
    beforeEach(fn: (t: TestController) => Promise<any>): this;
    afterEach(fn: (t: TestController) => Promise<any>): this;
    skip: this;
    only: this;
}

interface TestFn {
    (name: string, fn: (t: TestController) => Promise<any>): this;
    page(name: string): this;
    httpAuth(credentials: HTTPAuthCredentials): this;
    before(fn: (t: TestController) => Promise<any>): this;
    after(fn: (t: TestController) => Promise<any>): this;
    skip: this;
    only: this;
}

declare var fixture: FixtureFn;
declare var test: TestFn;
