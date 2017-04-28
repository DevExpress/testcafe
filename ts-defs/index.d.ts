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


// Selectors
//----------------------------------------------------------------------------
interface SelectorOptions {
    boundTestRun?: TestController;
    timeout?: number;
    visibilityCheck?: Boolean;
}

interface SelectorAPI {
    nth(index: number): Selector;

    withText(text: string): Selector;
    withText(re: RegExp): Selector;

    withAttribute(attrName: string, attrValue?: string): Selector;

    filter(cssSelector: string): Selector;
    filter(filterFn: (node: Element | Node, idx: number) => Boolean, dependencies?: {[key: string]: Function}): Selector;

    find(cssSelector: string): Selector;
    find(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => Boolean, dependencies?: {[key: string]: Function}): Selector;

    parent(): Selector;
    parent(index: number): Selector;
    parent(cssSelector: string): Selector;
    parent(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => Boolean, dependencies?: {[key: string]: Function}): Selector;

    child(): Selector;
    child(index: number): Selector;
    child(cssSelector: string): Selector;
    child(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => Boolean, dependencies?: {[key: string]: Function}): Selector;

    sibling(): Selector;
    sibling(index: number): Selector;
    sibling(cssSelector: string): Selector;
    sibling(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => Boolean, dependencies?: {[key: string]: Function}): Selector;

    nextSibling(): Selector;
    nextSibling(index: number): Selector;
    nextSibling(cssSelector: string): Selector;
    nextSibling(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => Boolean, dependencies?: {[key: string]: Function}): Selector;

    prevSibling(): Selector;
    prevSibling(index: number): Selector;
    prevSibling(cssSelector: string): Selector;
    prevSibling(filterFn: (node: Element | Node, idx: number, originNode: Element | Node) => Boolean, dependencies?: {[key: string]: Function}): Selector;

    exists: Promise<Boolean>;
    count: Promise<number>;
}

interface Selector extends SelectorAPI {
    (...args: any[]): SelectorPromise;
    addCustomDOMProperties(props: {[prop: string]: (node: Element | Node) => any}): Selector;
    addCustomMethods(methods: {[method: string]: (node: Element | Node, ...methodParams: any[]) => any}): Selector;
}

interface SelectorPromise extends SelectorAPI, Promise<NodeSnapshot> {
}

interface NodeSnapshot {

}

// TestController
//----------------------------------------------------------------------------
interface TestController {
    ctx: {[key: string]: any};
    readonly fixtureCtx: {[key: string]: any};
}


// Exportable lib
declare module 'testcafe' {
    export function Selector(init: string | Selector | Function | NodeSnapshot | SelectorPromise, options?: SelectorOptions): Selector;
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
