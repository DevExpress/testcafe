// ClientFunction
//----------------------------------------------------------------------------
interface ClientFunctionOptions {
    dependencies?: {[key: string]: Function},
    boundTestRun?: TestController
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
    nth(index: number): Selector;

    withText(text: string): Selector;
    withText(re: RegExp): Selector;

    withAttribute(attrName: string, attrValue?: string): SelectorPromise;


    filter(cssSelector: string): Selector;
    filter(filterFn: (node: Element, idx: number) => boolean,
           dependencies?: {[key: string]: Function}): Selector;


    find(cssSelector: string): Selector;
    find(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
         dependencies?: {[key: string]: Function}): Selector;


    parent(): Selector;
    parent(index: number): Selector;
    parent(cssSelector: string): Selector;
    parent(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
           dependencies?: {[key: string]: Function}): Selector;

    child(): Selector;
    child(index: number): Selector;
    child(cssSelector: string): Selector;
    child(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
          dependencies?: {[key: string]: Function}): Selector;

    sibling(): Selector;
    sibling(index: number): Selector;
    sibling(cssSelector: string): Selector;
    sibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
            dependencies?: {[key: string]: Function}): Selector;

    nextSibling(): Selector;
    nextSibling(index: number): Selector;
    nextSibling(cssSelector: string): Selector;
    nextSibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                dependencies?: {[key: string]: Function}): Selector;

    prevSibling(): Selector;
    prevSibling(index: number): Selector;
    prevSibling(cssSelector: string): Selector;
    prevSibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                dependencies?: {[key: string]: Function}): Selector;

    exists: Promise<boolean>;
    count: Promise<number>;

    addCustomDOMProperties(props: {[prop: string]: (node: Element) => any}): Selector;
    addCustomMethods(methods: {[method: string]: (node: Element, ...methodParams: any[]) => any}): Selector;

    with(options?: SelectorOptions): Selector;

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


// Action options
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

interface MouseActionOptions extends ActionOptions {
    offsetX?: number;
    offsetY?: number;
    modifiers?: KeyModifiers;
}

interface ClickActionOptions extends MouseActionOptions {
    caretPos?: number;
}

interface TypeActionOptions extends ClickActionOptions {
    replace?: boolean;
    paste?: boolean;
}

interface ResizeToFitDeviceOptions {
    portraitOrientation?: boolean;
}


// TestController
//----------------------------------------------------------------------------
interface NativeDialogHistoryItem {
    type: 'alert' | 'confirm' | 'beforeunload' | 'prompt';
    text: string;
    url: string;
}

interface TestController {
    ctx: {[key: string]: any};
    readonly fixtureCtx: {[key: string]: any};

    click(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
          options?: ClickActionOptions): TestControllerPromise;

    rightClick(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
               options?: ClickActionOptions): TestControllerPromise;

    doubleClick(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                options?: ClickActionOptions): TestControllerPromise;

    hover(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
          options?: MouseActionOptions): TestControllerPromise;

    drag(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
         dragOffsetX: number,
         dragOffsetY: number,
         options?: MouseActionOptions): TestControllerPromise;

    dragToElement(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                  destinationSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                  options?: MouseActionOptions): TestControllerPromise;

    typeText(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
             text: string,
             options?: TypeActionOptions): TestControllerPromise;


    selectText(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
               startPos: number,
               endPos: number,
               options?: ActionOptions): TestControllerPromise;

    selectTextAreaContent(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          startLine: number,
                          startPos: number,
                          endLine: number,
                          endPos: number,
                          options?: ActionOptions): TestControllerPromise;

    selectEditableContent(startSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          endSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          options?: ActionOptions): TestControllerPromise;

    pressKey(keys: string, options?: ActionOptions): TestControllerPromise;

    wait(timeout: number): TestControllerPromise;

    navigateTo(url: string): TestControllerPromise;

    setFilesToUpload(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                     filePath: String | String[]): TestControllerPromise;

    clearUpload(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection)): TestControllerPromise;

    takeScreenshot(path?: string): TestControllerPromise;

    resizeWindow(width: number, height: number): TestControllerPromise;

    resizeWindowToFitDevice(device: string, options?: ResizeToFitDeviceOptions): TestControllerPromise;

    maximizeWindow(): TestControllerPromise;

    switchToIframe(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection)): TestControllerPromise;

    switchToMainWindow(): TestControllerPromise;

    eval(fn: Function, options?: ClientFunctionOptions): Promise<any>;

    setNativeDialogHandler(fn: ((type: 'alert' | 'confirm' | 'beforeunload' | 'prompt', text: string, url: string) => any) | null,
                           options?: ClientFunctionOptions): TestControllerPromise;

    getNativeDialogHistory(): Promise<NativeDialogHistoryItem[]>;

    expect(actual: any): Assertion;

    debug(): TestControllerPromise;

    setTestSpeed(speed: number): TestControllerPromise;

    useRole(role: Role): TestControllerPromise;
}

interface TestControllerPromise extends TestController, Promise<any> {
}


// Assertions
interface AssertionOptions {
    timeout?: number;
}

interface Assertion {
    eql(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    notEql(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    ok(message?: string, options?: AssertionOptions): TestControllerPromise;
    notOk(message?: string, options?: AssertionOptions): TestControllerPromise;
    contains(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    notContains(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    typeOf(typeName: String, message?: string, options?: AssertionOptions): TestControllerPromise;
    notTypeOf(typeName: String, message?: string, options?: AssertionOptions): TestControllerPromise;
    gt(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    gte(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    lt(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    lte(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    within(start: number, finish: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    notWithin(start: number, finish: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    match(re: RegExp, message?: string, options?: AssertionOptions): TestControllerPromise;
    notMatch(re: RegExp, message?: string, options?: AssertionOptions): TestControllerPromise;
}

// Exportable lib
declare module 'testcafe' {
    export function Selector(init: string | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection) | Selector | NodeSnapshot | SelectorPromise,
                             options?: SelectorOptions): Selector;

    export function ClientFunction(fn: Function, options?: ClientFunctionOptions): ClientFunction;

    export var Role: {
        (url: String, fn: (t: TestController) => Promise<any>, options?: RoleOptions): Role;
        anonymous(): Role;
    };

    export var t: TestController;
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
