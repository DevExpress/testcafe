// ClientFunction
//----------------------------------------------------------------------------
interface ClientFunctionOptions {
    /**
     *  Contains functions, variables or objects used by the client function internally.
     *  Properties of the `dependencies` object will be added to the client function's scope as variables.
     */
    dependencies?: {[key: string]: Function},
    /**
     * If you need to call a client function from a Node.js callback, assign the current test controller to the `boundTestRun` option.
     */
    boundTestRun?: TestController
}

interface ClientFunction {
    /**
     * Client function
     *
     * @param args - function arguments.
     */
    (...args: any[]): Promise<any>;
    /**
     * Returns a new client function with a different set of options that includes options from the
     * original function and new `options` that overwrite the original ones.
     * @param options - new options.
     */
    with(options: ClientFunctionOptions): ClientFunction;
}

// NodeSnapshot
//----------------------------------------------------------------------------
interface TextRectangle {
    /**
     * Y-coordinate, relative to the viewport origin, of the bottom of the rectangle box.
     */
    bottom: number;
    /**
     * X-coordinate, relative to the viewport origin, of the left of the rectangle box.
     */
    left: number;
    /**
     * 	X-coordinate, relative to the viewport origin, of the right of the rectangle box.
     */
    right: number;
    /**
     * Y-coordinate, relative to the viewport origin, of the top of the rectangle box.
     */
    top: number;
    /**
     * Width of the rectangle box (This is identical to `right` minus `left`).
     */
    width: number;
    /**
     * Height of the rectangle box (This is identical to `bottom` minus `top`).
     */
    height: number;
}

interface NodeSnapshotProperties {
    /**
     * The number of child HTML elements.
     */
    childElementCount: number;
    /**
     * The number of child nodes.
     */
    childNodeCount: number;
    /**
     * `true` if this node has child HTML elements.
     */
    hasChildElements: boolean;
    /**
     * `true` if this node has child nodes.
     */
    hasChildNodes: boolean;
    /**
     * The type of the node.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
     */
    nodeType: number;
    /**
     * The text content of the node and its descendants.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
     */
    textContent: string;

    /**
     * Attributes of the element.
     */
    attributes?: {[name: string]: string};
    /**
     * The size of the element and its position relative to the viewport.
     */
    boundingClientRect?: TextRectangle;
    /**
     * For checkbox and radio input elements, their current state. For other elements, `undefined`.
     */
    checked?: boolean | undefined;
    /**
     * The list of element's classes.
     */
    classNames?: string[];
    /**
     * The inner height of the element, including padding but not the horizontal scrollbar height, border, or margin.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
     */
    clientHeight?: number;
    /**
     * The width of the left border of the element.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
     */
    clientLeft?: number;
    /**
     * The width of the top border of the element.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
     */
    clientTop?: number;
    /**
     * 	The inner width of the element, including padding but not the vertical scrollbar width, border, or margin.
     * 	See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
     */
    clientWidth?: number;
    /**
     * 	`true` if the element is focused.
     */
    focused?: boolean;
    /**
     * 	The element's identifier.
     * 	See https://developer.mozilla.org/en-US/docs/Web/API/Element/id
     */
    id?: string;
    /**
     * The element's text content "as rendered".
     * See https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
     */
    innerText?: string;
    /**
     * 	The namespace URI of the element. If the element does not have a namespace, this property is set to null.
     * 	See https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI
     */
    namespaceURI?: string | null;
    /**
     * The height of the element including vertical padding and borders.
     * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
     */
    offsetHeight?: number;
    /**
     * The number of pixels that the upper left corner of the element is offset by to the left within the `offsetParent` node.
     * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft
     */
    offsetLeft?: number;
    /**
     * The number of pixels that the upper left corner of the element is offset by to the top within the offsetParent node.
     * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
     */
    offsetTop?: number;
    /**
     * The width of the element including vertical padding and borders.
     * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
     */
    offsetWidth?: number;
    /**
     * Indicates that `<option>` element is currently selected. For other elements, `undefined`.
     */
    selected?: boolean | undefined;
    /**
     * 	For `<select>` element, the index of the first selected `<option>` element. For other elements, `undefined`.
     */
    selectedIndex?: number | undefined;
    /**
     * The height of the element's content, including content not visible on the screen due to overflow.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
     */
    scrollHeight?: number;
    /**
     * The number of pixels that the element's content is scrolled to the left.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
     */
    scrollLeft?: number;
    /**
     * The number of pixels that the element's content is scrolled upward.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
     */
    scrollTop?: number;
    /**
     * Either the width in pixels of the element's content or the width of the element itself, whichever is greater.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
     */
    scrollWidth?: number;
    /**
     * The computed values of element's CSS properties.
     */
    style?: {[prop: string]: string};
    /**
     * The name of the element.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
     */
    tagName?: string;
    /**
     * For input elements, the current value in the control. For other elements, `undefined`.
     */
    value?: string | undefined;
    /**
     * `true` if the element is visible.
     */
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
    eql(expected: any, options?: AssertionOptions): TestControllerPromise;

    notEql(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    notEql(expected: any, options?: AssertionOptions): TestControllerPromise;

    ok(message?: string, options?: AssertionOptions): TestControllerPromise;
    ok(options?: AssertionOptions): TestControllerPromise;

    notOk(message?: string, options?: AssertionOptions): TestControllerPromise;
    notOk(options?: AssertionOptions): TestControllerPromise;

    contains(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    contains(expected: any, options?: AssertionOptions): TestControllerPromise;

    notContains(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    notContains(expected: any, options?: AssertionOptions): TestControllerPromise;

    typeOf(typeName: String, message?: string, options?: AssertionOptions): TestControllerPromise;
    typeOf(typeName: String, options?: AssertionOptions): TestControllerPromise;

    notTypeOf(typeName: String, message?: string, options?: AssertionOptions): TestControllerPromise;
    notTypeOf(typeName: String, options?: AssertionOptions): TestControllerPromise;

    gt(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    gt(expected: number, options?: AssertionOptions): TestControllerPromise;

    gte(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    gte(expected: number,options?: AssertionOptions): TestControllerPromise;

    lt(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    lt(expected: number, options?: AssertionOptions): TestControllerPromise;

    lte(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    lte(expected: number,options?: AssertionOptions): TestControllerPromise;

    within(start: number, finish: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    within(start: number, finish: number, options?: AssertionOptions): TestControllerPromise;

    notWithin(start: number, finish: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    notWithin(start: number, finish: number, options?: AssertionOptions): TestControllerPromise;

    match(re: RegExp, message?: string, options?: AssertionOptions): TestControllerPromise;
    match(re: RegExp, options?: AssertionOptions): TestControllerPromise;

    notMatch(re: RegExp, message?: string, options?: AssertionOptions): TestControllerPromise;
    notMatch(re: RegExp, options?: AssertionOptions): TestControllerPromise;

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
