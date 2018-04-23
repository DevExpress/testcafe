// ClientFunction
//----------------------------------------------------------------------------
interface ClientFunctionOptions {
    /**
     *  Contains functions, variables or objects used by the client function internally.
     *  Properties of the `dependencies` object will be added to the client function's scope as variables.
     */
    dependencies?: {[key: string]: any},
    /**
     * If you need to call a client function from a Node.js callback, assign the current test controller to the `boundTestRun` option.
     */
    boundTestRun?: TestController
}

interface ClientFunction {
    /**
     * Client function
     *
     * @param args - Function arguments.
     */
    (...args: any[]): Promise<any>;
    /**
     * Returns a new client function with a different set of options that includes options from the
     * original function and new `options` that overwrite the original ones.
     *
     * @param options - New options.
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
     *    X-coordinate, relative to the viewport origin, of the right of the rectangle box.
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


interface NodeSnapshot {
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
     * The inner width of the element, including padding but not the vertical scrollbar width, border, or margin.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
     */
    clientWidth?: number;
    /**
     * `true` if the element is focused.
     */
    focused?: boolean;
    /**
     * The element's identifier.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/id
     */
    id?: string;
    /**
     * The element's text content "as rendered".
     * See https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
     */
    innerText?: string;
    /**
     * The namespace URI of the element. If the element does not have a namespace, this property is set to null.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI
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
     *    For `<select>` element, the index of the first selected `<option>` element. For other elements, `undefined`.
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
    /**
     * `true` if the element has the specified class name.
     *
     * @param className - Name of the class.
     */
    hasClass?(className: string): boolean;
    /**
     * Returns the computed value of the CSS property.
     *
     * @param propertyName - The name of the CSS property.
     */
    getStyleProperty?(propertyName: string): string;
    /**
     *    Returns the value of the attribute.
     *
     * @param attributeName - The name of the attribute.
     */
    getAttribute?(attributeName: string): string;
    /**
     * Returns the value of the property from the `boundingClientRect` object.
     *
     * @param propertyName - The name of the property.
     */
    getBoundingClientRectProperty?(propertyName: string): number;
    /**
     * `true` if the element has the attribute.
     *
     * @param attributeName - The name of the attribute.
     */
    hasAttribute?(attributeName: string): boolean;
}

// Selectors
//----------------------------------------------------------------------------
interface SelectorOptions {
    /**
     * If you need to call a selector from a Node.js callback, assign the current test
     * controller to the `boundTestRun` option.
     */
    boundTestRun?: TestController;
    /**
     * The amount of time, in milliseconds, allowed for an element returned by the
     * selector to appear in the DOM before the test fails.
     */
    timeout?: number;
    /**
     * `true` to additionally require the returned element to become visible within `options.timeout`.
     */
    visibilityCheck?: boolean;
}

interface SelectorAPI {
    /**
     * The number of child HTML elements.
     */
    childElementCount: Promise<number>;
    /**
     * The number of child nodes.
     */
    childNodeCount: Promise<number>;
    /**
     * `true` if this node has child HTML elements.
     */
    hasChildElements: Promise<boolean>;
    /**
     * `true` if this node has child nodes.
     */
    hasChildNodes: Promise<boolean>;
    /**
     * The type of the node.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
     */
    nodeType: Promise<number>;
    /**
     * The text content of the node and its descendants.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
     */
    textContent: Promise<string>;
    /**
     * Attributes of the element.
     */
    attributes: Promise<{[name: string]: string}>;
    /**
     * The size of the element and its position relative to the viewport.
     */
    boundingClientRect: Promise<TextRectangle>;
    /**
     * For checkbox and radio input elements, their current state. For other elements, `undefined`.
     */
    checked: Promise<boolean | undefined>;
    /**
     * The list of element's classes.
     */
    classNames: Promise<string[]>;
    /**
     * The inner height of the element, including padding but not the horizontal scrollbar height, border, or margin.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight
     */
    clientHeight: Promise<number>;
    /**
     * The width of the left border of the element.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft
     */
    clientLeft: Promise<number>;
    /**
     * The width of the top border of the element.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop
     */
    clientTop: Promise<number>;
    /**
     * The inner width of the element, including padding but not the vertical scrollbar width, border, or margin.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth
     */
    clientWidth: Promise<number>;
    /**
     * `true` if the element is focused.
     */
    focused: Promise<boolean>;
    /**
     * The element's identifier.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/id
     */
    id: Promise<string>;
    /**
     * The element's text content "as rendered".
     * See https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute
     */
    innerText: Promise<string>;
    /**
     *    The namespace URI of the element. If the element does not have a namespace, this property is set to null.
     *    See https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI
     */
    namespaceURI: Promise<string | null>;
    /**
     * The height of the element including vertical padding and borders.
     * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight
     */
    offsetHeight: Promise<number>;
    /**
     * The number of pixels that the upper left corner of the element is offset by to the left within the `offsetParent` node.
     * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft
     */
    offsetLeft: Promise<number>;
    /**
     * The number of pixels that the upper left corner of the element is offset by to the top within the offsetParent node.
     * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
     */
    offsetTop: Promise<number>;
    /**
     * The width of the element including vertical padding and borders.
     * See https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth
     */
    offsetWidth: Promise<number>;
    /**
     * Indicates that `<option>` element is currently selected. For other elements, `undefined`.
     */
    selected: Promise<boolean | undefined>;
    /**
     *    For `<select>` element, the index of the first selected `<option>` element. For other elements, `undefined`.
     */
    selectedIndex: Promise<number | undefined>;
    /**
     * The height of the element's content, including content not visible on the screen due to overflow.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight
     */
    scrollHeight: Promise<number>;
    /**
     * The number of pixels that the element's content is scrolled to the left.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft
     */
    scrollLeft: Promise<number>;
    /**
     * The number of pixels that the element's content is scrolled upward.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop
     */
    scrollTop: Promise<number>;
    /**
     * Either the width in pixels of the element's content or the width of the element itself, whichever is greater.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth
     */
    scrollWidth: Promise<number>;
    /**
     * The computed values of element's CSS properties.
     */
    style: Promise<{[prop: string]: string}>;
    /**
     * The name of the element.
     * See https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName
     */
    tagName: Promise<string>;
    /**
     * For input elements, the current value in the control. For other elements, `undefined`.
     */
    value: Promise<string | undefined>;
    /**
     * `true` if the element is visible.
     */
    visible: Promise<boolean>;
    /**
     * `true` if the element has the specified class name.
     *
     * @param className - The name of the class.
     */
    hasClass(className: string): Promise<boolean>;
    /**
     * Returns the computed value of the CSS property.
     *
     * @param propertyName - The name of the CSS property.
     */
    getStyleProperty(propertyName: string): Promise<string>;
    /**
     *    Returns the value of the attribute.
     *
     * @param attributeName - The name of the attribute.
     */
    getAttribute(attributeName: string): Promise<string>;
    /**
     * Returns the value of the property from the `boundingClientRect` object.
     *
     * @param propertyName - The name of the property.
     */
    getBoundingClientRectProperty(propertyName: string): Promise<number>;
    /**
     * `true` if the element has the attribute.
     *
     * @param attributeName - The name of the attribute.
     */
    hasAttribute(attributeName: string): Promise<boolean>;
    /**
     * Creates a selector that returns an element by its index in the matching set.
     *
     * @param index - A zero-based index of the element. If negative, then counted from the end of the matching set.
     */
    nth(index: number): Selector;
    /**
     * Creates a selector that filters a matching set by the specified text.
     *
     * @param text - The text in the element.
     */
    withText(text: string): Selector;
    /**
     * Creates a selector that filters a matching set using the specified regular expression.
     *
     * @param re - The regular expression for the text in the element.
     */
    withText(re: RegExp): Selector;
    /**
     * Creates a selector that filters a matching set by the specified text. Selects elements whose text content *strictly matches* this text.
     *
     * @param text - The text in the element.
     */
    withExactText(text: string): Selector;
    /**
     * Creates a selector that filters a matching set by the specified attribute and, optionally, attribute value.
     *
     * @param attrName - The attribute name.
     * @param attrValue - The attribute value.You can omit this parameter to select elements that have
     * the `attrName` attribute regardless of the value.
     */
    withAttribute(attrName: string | RegExp, attrValue?: string | RegExp): SelectorPromise;
    /**
     * Creates a selector that filters a matching set by cssSelector.
     *
     * @param cssSelector - A CSS selector string.
     */
    filter(cssSelector: string): Selector;
    /**
     * Creates a selector that filters a matching set by the `filterFn` predicate.
     *
     * @param filterFn - The predicate.
     * @param filterFn `node` - The current DOM node.
     * @param filterFn `idx` - Index of the current node among other nodes in the matching set.
     * @param dependencies - Predicate dependencies.
     */
    filter(filterFn: (node: Element, idx: number) => boolean,
           dependencies?: {[key: string]: any}): Selector;
    /**
     * Creates a selector that filters a matching set leaving only visible elements.
     */
    filterVisible(): Selector;
    /**
     * Creates a selector that filters a matching set leaving only hidden elements.
     */
    filterHidden(): Selector;
    /**
     * Finds all descendants of all nodes in the matching set and filters them by `cssSelector`.
     *
     * @param cssSelector - A CSS selector string.
     */
    find(cssSelector: string): Selector;
    /**
     * Finds all descendants of all nodes in the matching set and filters them using `filterFn` predicate.
     *
     * @param filterFn - The predicate.
     * @param filterFn `node` - The current descendant node.
     * @param filterFn `idx` - A zero-based index of `node` among other descendant nodes.
     * @param filterFn `originNode` - A node from the left-hand selector's matching set whose descendants are being iterated.
     * @param dependencies - Predicate dependencies.
     */
    find(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
         dependencies?: {[key: string]: any}): Selector;
    /**
     * Finds all parents of all nodes in the matching set (first element in the set will be the closest parent).
     */
    parent(): Selector;
    /**
     * Finds all parents of all nodes in the matching set and filters them by `index`.
     *
     * @param index - A zero-based index of the parent (0 is the closest). If negative, then counted from the end of the matching set.
     */
    parent(index: number): Selector;
    /**
     * Finds all parents of all nodes in the matching set and filters them by `cssSelector`.
     *
     * @param cssSelector - A CSS selector string.
     */
    parent(cssSelector: string): Selector;
    /**
     * Finds all parents of all nodes in the matching set and filters them by the `filterFn` predicate.
     *
     * @param filterFn - The predicate.
     * @param filterFn `node` - The current parent node.
     * @param filterFn `idx` - A zero-based index of `node` among other parent nodes.
     * @param filterFn `originNode` - A node from the left-hand selector's matching set whose parents are being iterated.
     * @param dependencies - Predicate dependencies.
     */
    parent(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
           dependencies?: {[key: string]: any}): Selector;
    /**
     * Finds all child elements (not nodes) of all nodes in the matching set.
     */
    child(): Selector;
    /**
     * Finds all child elements (not nodes) of all nodes in the matching set and filters them by `index`.
     *
     * @param index - A zero-based index of the child. If negative, then counted from the end of the matching set.
     */
    child(index: number): Selector;
    /**
     * Finds all child elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
     *
     * @param cssSelector - A CSS selector string.
     */
    child(cssSelector: string): Selector;
    /**
     * Finds all child elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
     *
     * @param filterFn - The predicate.
     * @param filterFn `node` - The current child node.
     * @param filterFn `idx` - A zero-based index of `node` among other child nodes.
     * @param filterFn `originNode` - A node from the left-hand selector's matching set children parents are being iterated.
     * @param dependencies - Predicate dependencies.
     */
    child(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
          dependencies?: {[key: string]: any}): Selector;
    /**
     * Finds all sibling elements (not nodes) of all nodes in the matching set.
     */
    sibling(): Selector;
    /**
     * Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
     *
     * @param index -  a zero-based index of the sibling. If negative, then counted from the end of the matching set.
     */
    sibling(index: number): Selector;
    /**
     * nds all sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
     *
     * @param cssSelector - A CSS selector string.
     */
    sibling(cssSelector: string): Selector;
    /**
     * Finds all sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
     *
     * @param filterFn - The predicate.
     * @param filterFn `node` - The current sibling node.
     * @param filterFn `idx` - A zero-based index of `node` among other sibling nodes.
     * @param filterFn `originNode` - A node from the left-hand selector's matching set whose siblings are being iterated.
     * @param dependencies - Predicate dependencies.
     */
    sibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
            dependencies?: {[key: string]: any}): Selector;
    /**
     * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set.
     */
    nextSibling(): Selector;
    /**
     * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
     *
     * @param index - A zero-based index of the succeeding sibling. If negative, then counted from the end of the matching set.
     */
    nextSibling(index: number): Selector;
    /**
     * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
     *
     * @param cssSelector - A CSS selector string.
     */
    nextSibling(cssSelector: string): Selector;
    /**
     * Finds all succeeding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
     *
     * @param filterFn - The predicate.
     * @param filterFn `node` - The current succeeding sibling node.
     * @param filterFn `idx` - A zero-based index of `node` among other succeeding sibling nodes.
     * @param filterFn `originNode` - A node from the left-hand selector's matching set whose succeeding siblings are being iterated.
     * @param dependencies - Predicate dependencies.
     */
    nextSibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                dependencies?: {[key: string]: any}): Selector;
    /**
     * Finds all preceding sibling elements (not nodes) of all nodes in the matching set.
     */
    prevSibling(): Selector;
    /**
     *  Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `index`.
     *
     * @param index - A zero-based index of the preceding sibling. If negative, then counted from the end of the matching set.
     */
    prevSibling(index: number): Selector;
    /**
     * Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by `cssSelector`.
     *
     * @param cssSelector - A CSS selector string.
     */
    prevSibling(cssSelector: string): Selector;
    /**
     * Finds all preceding sibling elements (not nodes) of all nodes in the matching set and filters them by the `filterFn` predicate.
     *
     * @param filterFn - The predicate.
     * @param filterFn `node` - The current preceding sibling node.
     * @param filterFn `idx` - A zero-based index of `node` among other preceding sibling nodes.
     * @param filterFn `originNode` - A node from the left-hand selector's matching set whose preceding siblings are being iterated.
     * @param dependencies - Predicate dependencies.
     */
    prevSibling(filterFn: (node: Element, idx: number, originNode: Element) => boolean,
                dependencies?: {[key: string]: any}): Selector;
    /**
     * `true if` at least one matching element exists.
     */
    exists: Promise<boolean>;
    /**
     * The number of matching elements.
     */
    count: Promise<number>;
    /**
     *  Adds custom selector properties.
     *
     * @param props - Property descriptors.
     * @param props `prop` - Property name.
     * @param props `[prop]` - The function that calculate property values. Executed on the client side in the browser.
     * @param props `node` - The matching DOM node for which custom property is calculated.
     */
    addCustomDOMProperties(props: {[prop: string]: (node: Element) => any}): Selector;
    /**
     * Adds custom selector methods.
     *
     * @param methods - Method descriptors.
     * @param methods `method` - The method name.
     * @param methods `[method]` - The function that contains method code. Executed on the client side in the browser.
     * @param methods `node` - The matching DOM node for which custom method is executed.
     * @param methods `methodParams` - Custom method parameters.
     */
    addCustomMethods(methods: {[method: string]: (node: Element, ...methodParams: any[]) => any}, opts?: {returnDOMNodes?: boolean}): Selector;
    /**
     * Returns a new selector with a different set of options that includes options from the
     * original selector and new `options` that overwrite the original ones.
     *
     * @param options - New options.
     */
    with(options?: SelectorOptions): Selector;
}

interface Selector extends SelectorAPI {
    /**
     * Creates parametrized selector.
     *
     * @param args - Selector parameters.
     */
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
    /**
     * Use this option to control which page is opened after you switch to the role.
     *
     * By default, TestCafe navigates back to the page that was opened previously to switching to the role.
     * Set the `preserveUrl` option to true to save the URL to which the browser was redirected after logging in.
     * TestCafe will navigate to the saved URL each time after you switch to this role.
     *
     * This option is useful if you store session-related data (like session ID) in the URL.
     */
    preserveUrl?: boolean;
}


// Action options
//----------------------------------------------------------------------------
interface KeyModifiers {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean
}

interface CropOptions {
    /**
     * The top edge of the cropping rectangle. The coordinate is calculated from the element's top edge.
     * If a negative number is passed, the coordinate is calculated from the element's bottom edge.
     */
    left?: number;
    /**
     * The left edge of the cropping rectangle. The coordinate is calculated from the element's left edge.
     * If a negative number is passed, the coordinate is calculated from the element's right edge.
     */
    right?: number;
    /**
     * The bottom edge of the cropping rectangle. The coordinate is calculated from the element's top edge.
     * If a negative number is passed, the coordinate is calculated from the element's bottom edge.
     */
    top?: number;
    /**
     * The right edge of the cropping rectangle. The coordinate is calculated from the element's left edge.
     * If a negative number is passed, the coordinate is calculated from the element's right edge.
     */
    bottom?: number;
}

interface ActionOptions {
    /**
     * The speed of action emulation. Defines how fast TestCafe performs the action when running tests.
     * A value between 1 (the maximum speed) and 0.01 (the minimum speed). If test speed is also specified in the CLI or
     * programmatically, the action speed setting overrides test speed. Default is 1.
     */
    speed?: number;
}

interface TakeElementScreenshotOptions extends ActionOptions {
    /**
     * Allows to crop the target element on the screenshot.
     */
    crop?: CropOptions;
    /**
     * Controls if element's margins should be included in the screenshot.
     * Set this property to `true` to include target element's margins in the screenshot.
     * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
     * the corners where top and left (or bottom and right) margins intersect
     */
    includeMargins?: boolean;
    /**
     * Controls if element's borders should be included in the screenshot.
     * Set this property to `true` to include target element's borders in the screenshot.
     * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
     * the corners where top and left (or bottom and right) internal edges of the element  intersect
     */
    includeBorders?: boolean;
    /**
     * Controls if element's paddings should be included in the screenshot.
     * Set this property to `true` to include target element's paddings in the screenshot.
     * When it is enabled, the `scrollTargetX`, `scrollTargetY` and `crop` rectangle coordinates are calculated from
     * the corners where top and left (or bottom and right) edges of the element's content area intersect
     */
    includePaddings?: boolean;
    /**
     * Specifies the X coordinate of the scrolling target point.
     * If the target element is too big to fit into the browser window, the page will be scrolled to put this point
     * to the center of the viewport. The coordinates of this point are calculated relative to the target element.
     * If the numbers are positive, the point is positioned relative to the top-left corner of the element.
     * If the numbers are negative, the point is positioned relative to the bottom-right corner.
     * If the target element fits into the browser window, these properties have no effect.
     */
    scrollTargetX?: number;
    /**
     * Specifies the Y coordinate of the scrolling target point.
     * If the target element is too big to fit into the browser window, the page will be scrolled to put this point
     * to the center of the viewport. The coordinates of this point are calculated relative to the target element.
     * If the numbers are positive, the point is positioned relative to the top-left corner of the element.
     * If the numbers are negative, the point is positioned relative to the bottom-right corner.
     * If the target element fits into the browser window, these properties have no effect.
     */
    scrollTargetY?: number;
}

interface MouseActionOptions extends ActionOptions {
    /**
     * Mouse pointer X coordinate that define a point where the action is performed or started.
     * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element.
     * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
     * The default is the center of the target element.
     */
    offsetX?: number;
    /**
     * Mouse pointer Y coordinate that define a point where the action is performed or started.
     * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the target element.
     * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
     * The default is the center of the target element.
     */
    offsetY?: number;
    /**
     * Indicate which modifier keys are to be pressed during the mouse action.
     */
    modifiers?: KeyModifiers;
}

interface ClickActionOptions extends MouseActionOptions {
    /**
     * The initial caret position if the action is performed on a text input field. A zero-based integer.
     * The default is the length of the input field content.
     */
    caretPos?: number;
}

interface TypeActionOptions extends ClickActionOptions {
    /**
     * `true` to remove the current text in the target element, and false to leave the text as it is.
     */
    replace?: boolean;
    /**
     * `true` to insert the entire block of current text in a single keystroke (similar to a copy & paste function),
     * and false to insert the current text character by character.
     */
    paste?: boolean;
}

interface DragToElementOptions extends MouseActionOptions {
    /**
     * Mouse pointer X coordinate that defines a point where the dragToElement action is finished.
     * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the destination element.
     * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
     * By default, the dragToElement action is finished in the center of the destination element.
     */
    destinationOffsetX?: number;
    /**
     * Mouse pointer Y coordinate that defines a point where the dragToElement action is finished.
     * If an offset is a positive integer, coordinates are calculated relative to the top-left corner of the destination element.
     * If an offset is a negative integer, they are calculated relative to the bottom-right corner.
     * By default, the dragToElement action is finished in the center of the destination element.
     */
    destinationOffsetY?: number;
}

interface ResizeToFitDeviceOptions {
    /**
     * `true` for portrait screen orientation; `false` for landscape.
     */
    portraitOrientation?: boolean;
}


// TestController
//----------------------------------------------------------------------------
interface NativeDialogHistoryItem {
    /**
     * The type of the native dialog.
     */
        type: 'alert' | 'confirm' | 'beforeunload' | 'prompt';
    /**
     * Text of the dialog message.
     */
    text: string;
    /**
     * The URL of the page that invoked the dialog. Use it to determine if the dialog originated
     * from the main window or an `<iframe>`.
     */
    url: string;
}

interface BrowserConsoleMessages {
    /**
     * Messages output to the browser console by the console.log() method.
     */
    log: string[],
    /**
     * Warning messages output to the browser console by the console.warn() method.
     */
    warn: string[],
    /**
     * Error messages output to the browser console by the console.error() method.
     */
    error: string[],
    /**
     * Information messages output to the browser console by the console.info() method.
     */
    info: string[]
}

interface TestController {
    /**
     * Dictionary that is shared between test hook functions and test code.
     */
    ctx: {[key: string]: any};
    /**
     * Dictionary that is shared between `fixture.before` and `fixture.after`, test hook functions and test code.
     */
    readonly fixtureCtx: {[key: string]: any};
    /**
     * Clicks a webpage element.
     *
     * @param selector - Identifies the webpage element being clicked.
     * @param options - A set of options that provide additional parameters for the action.
     */
    click(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
          options?: ClickActionOptions): TestControllerPromise;
    /**
     * Right-clicks a webpage element.
     *
     * @param selector - Identifies the webpage element being right-clicked.
     * @param options - A set of options that provide additional parameters for the action.
     */
    rightClick(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
               options?: ClickActionOptions): TestControllerPromise;
    /**
     * Double-clicks a webpage element.
     *
     * @param selector - Identifies the webpage element being double-clicked.
     * @param options - A set of options that provide additional parameters for the action.
     */
    doubleClick(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                options?: ClickActionOptions): TestControllerPromise;
    /**
     * Hovers the mouse pointer over a webpage element.
     *
     * @param selector - Identifies the webpage element being hovered over.
     * @param options - A set of options that provide additional parameters for the action.
     */
    hover(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
          options?: MouseActionOptions): TestControllerPromise;
    /**
     * Drags an element by an offset.
     *
     * @param selector - Identifies the webpage element being dragged
     * @param dragOffsetX - An X-offset of the drop coordinates from the mouse pointer's initial position.
     * @param dragOffsetY - An Y-offset of the drop coordinates from the mouse pointer's initial position.
     * @param options - A set of options that provide additional parameters for the action.
     */
    drag(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
         dragOffsetX: number,
         dragOffsetY: number,
         options?: MouseActionOptions): TestControllerPromise;
    /**
     * Drags an element onto another one.
     *
     * @param selector - Identifies the webpage element being dragged.
     * @param destinationSelector - Identifies the webpage element that serves as the drop location.
     * @param options - A set of options that provide additional parameters for the action.
     */
    dragToElement(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                  destinationSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                  options?: DragToElementOptions): TestControllerPromise;
    /**
     * Types the specified text into an input element.
     *
     * @param selector - Identifies the webpage element that will receive input focus.
     * @param text - The text to be typed into the specified webpage element.
     * @param options - A set of options that provide additional parameters for the action.
     */
    typeText(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
             text: string,
             options?: TypeActionOptions): TestControllerPromise;
    /**
     * Selects text in input elements.
     *
     * @param selector - Identifies the webpage element whose text will be selected.
     * @param startPos - The start position of the selection. A zero-based integer.
     * @param endPos - The end position of the selection. A zero-based integer.
     * @param options - A set of options that provide additional parameters for the action.
     */
    selectText(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
               startPos?: number,
               endPos?: number,
               options?: ActionOptions): TestControllerPromise;
    /**
     * Selects `<textarea>` content.
     *
     * @param selector
     * @param startLine
     * @param startPos
     * @param endLine
     * @param endPos
     * @param options
     */
    selectTextAreaContent(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          startLine?: number,
                          startPos?: number,
                          endLine?: number,
                          endPos?: number,
                          options?: ActionOptions): TestControllerPromise;
    /**
     * Performs selection within editable content
     *
     * @param startSelector - Identifies a webpage element from which selection starts. The start position of selection is the first character of the element's text.
     * @param endSelector - Identifies a webpage element at which selection ends. The end position of selection is the last character of the element's text.
     * @param options - A set of options that provide additional parameters for the action.
     */
    selectEditableContent(startSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          endSelector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          options?: ActionOptions): TestControllerPromise;
    /**
     * Presses the specified keyboard keys.
     *
     * @param keys - The sequence of keys and key combinations to be pressed.
     * @param options - A set of options that provide additional parameters for the action.
     */
    pressKey(keys: string, options?: ActionOptions): TestControllerPromise;
    /**
     * Pauses a test for a specified period of time.
     *
     * @param timeout - The pause duration, in milliseconds.
     */
    wait(timeout: number): TestControllerPromise;
    /**
     * Navigates to the specified URL.
     *
     * @param url - The URL to navigate to. Absolute or relative to the current page.
     * You can use the `file://` scheme or relative paths to navigate to a webpage in a local directory.
     */
    navigateTo(url: string): TestControllerPromise;
    /**
     * Populates the specified file upload input with file paths.
     *
     * @param selector - Identifies the input field to which file paths are written.
     * @param filePath - The path to the uploaded file, or several such paths. Relative paths resolve from the folder with the test file.
     */
    setFilesToUpload(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                     filePath: String | String[]): TestControllerPromise;
    /**
     * Removes all file paths from the specified file upload input.
     *
     * @param selector - Identifies the input field that needs to be cleared.
     */
    clearUpload(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection)): TestControllerPromise;
    /**
     * Takes a screenshot of the tested page.
     *
     * @param path - relative path to the screenshot file. Resolved from the screenshot directory specified by
     * using the `runner.screenshots` API method or the `screenshots-path` command line option.
     * If path doesn't have .png extension, it will be added automatically.
     */
    takeScreenshot(path?: string): TestControllerPromise;
    /**
     * Takes a screenshot of the specified element.
     *
     * @param selector - Identifies the element for screenshot capturing.
     * @param path - relative path to the screenshot file. Resolved from the screenshot  directory specified by
     * using the `runner.screenshots` API method or the `screenshots-path` command line option.
     * If path doesn't have .png extension, it will be added automatically.
     */
    takeElementScreenshot(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection),
                          path?:    string,
                          options?: TakeElementScreenshotOptions): TestControllerPromise
    /**
     * Sets the browser window size.
     *
     * @param width - The new width, in pixels.
     * @param height - The new height, in pixels.
     */
    resizeWindow(width: number, height: number): TestControllerPromise;

    /**
     * Fits the browser window into a particular device.
     *
     * @param deviceName - The name of the device as listed at http://viewportsizes.com/.
     * @param options - Provide additional information about the device.
     */
    resizeWindowToFitDevice(deviceName: string, options?: ResizeToFitDeviceOptions): TestControllerPromise;
    /**
     * Maximizes the browser window.
     */
    maximizeWindow(): TestControllerPromise;
    /**
     * Switches the test's browsing context to the specified `<iframe>`.
     *
     * @param selector - Identifies an `<iframe>` on the tested page.
     */
    switchToIframe(selector: string | Selector | NodeSnapshot | SelectorPromise | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection)): TestControllerPromise;
    /**
     * Switches the test's browsing context from an `<iframe>` back to the main window.
     */
    switchToMainWindow(): TestControllerPromise;
    /**
     * Executes function on client and returns it's result.
     *
     * @param fn - A function to be executed on the client side.
     * @param options - Function options.
     */
    eval(fn: Function, options?: ClientFunctionOptions): Promise<any>;
    /**
     * Specifies handler function for the browser native dialogs.
     *
     * @param fn - A regular or client function that will be triggered whenever a native dialog is invoked. null to
     * remove the native dialog handler.
     * @param fn `type` - The type of the native dialog.
     * @param fn `text` - Text of the dialog message.
     * @param fn `url` - The URL of the page that invoked the dialog. Use it to determine if the dialog originated from
     * the main window or an `<iframe>`.
     * @param options - Handler options.
     */
    setNativeDialogHandler(fn: ((type: 'alert' | 'confirm' | 'beforeunload' | 'prompt', text: string, url: string) => any) | null,
                           options?: ClientFunctionOptions): TestControllerPromise;
    /**
     * Returns a stack of history entries (i.e., an array in which the latest dialog has an index of 0). Each entry
     * corresponds to a certain native dialog that appears in the main window or in an `<iframe>`.
     */
    getNativeDialogHistory(): Promise<NativeDialogHistoryItem[]>;
    /**
     * Returns an object that contains messages output to the browser console.
     */
    getBrowserConsoleMessages(): Promise<BrowserConsoleMessages>;
    /**
     * Starts an assertion chain and specifies assertion actual value.
     *
     * @param actual - An actual value of the assertion.
     */
    expect(actual: any): Assertion;
    /**
     * Pauses the test and switches to the step-by-step execution mode.
     */
    debug(): TestControllerPromise;
    /**
     * Specifies the speed of test execution.
     *
     * @param speed - Specifies the test speed. Must be a number between 1 (the fastest) and 0.01 (the slowest).
     */
    setTestSpeed(speed: number): TestControllerPromise;
    /**
     * Specifies the amount of time within which TestCafe waits for the `window.load` event to fire before starting the test.
     *
     * @param duration - Specifies the amount of time within which TestCafe waits for the `window.load` event to fire before starting the test.
     */
    setPageLoadTimeout(duration: number): TestControllerPromise;
    /**
     * Switches user role.
     *
     * @param role - The role you need to use further in the test.
     */
    useRole(role: Role): TestControllerPromise;
}

interface TestControllerPromise extends TestController, Promise<any> {
}


// Assertions
interface AssertionOptions {
    /**
     * The amount of time, in milliseconds, allowed for an assertion to pass before the test fails if a
     * selector property or a client function was used in assertion.
     */
    timeout?: number;
    /**
     * By default, a Promise is not allowed to be passed to an assertion unless it is a selector property
     * or the result of a client function. Setting this property to `true` overrides that default.
     */
    allowUnawaitedPromise?: boolean;
}

interface Assertion {
    /**
     * Asserts that `actual` is deeply equal to `expected`.
     *
     * @param expected - An expected value.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    eql(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that actual is deeply equal to expected.
     *
     * @param expected - An expected value.
     * @param options - Assertion options.
     */
    eql(expected: any, options?: AssertionOptions): TestControllerPromise;
    /**
     * Assert that `actual` is not deeply equal to `unexpected`.
     *
     * @param unexpected - An unexpected value.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    notEql(unexpected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Assert that `actual` is not deeply equal to `unexpected`.
     *
     * @param unexpected - An unexpected value.
     * @param options - Assertion options.
     */
    notEql(unexpected: any, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is truthy.
     *
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    ok(message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is truthy.
     *
     * @param options - Assertion options.
     */
    ok(options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is falsy.
     *
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    notOk(message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is falsy.
     *
     * @param options - Assertion options.
     */
    notOk(options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` contains `expected`.
     *
     * @param expected - An expected value.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    contains(expected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` contains `expected`.
     *
     * @param expected - An expected value.
     * @param options - Assertion options.
     */
    contains(expected: any, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` not contains `unexpected`.
     *
     * @param unexpected - An unexpected value.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    notContains(unexpected: any, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` not contains `unexpected`.
     *
     * @param unexpected - An unexpected value.
     * @param options - Assertion options.
     */
    notContains(unexpected: any, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that type of `actual` is `typeName`.
     *
     * @param typeName - The expected type of an `actual` value.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    typeOf(typeName: String, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that type of `actual` is `typeName`.
     *
     * @param typeName - The expected type of an `actual` value.
     * @param options - Assertion options.
     */
    typeOf(typeName: String, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that type of `actual` is not `typeName`.
     *
     * @param typeName - An unexpected type of an `actual` value.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    notTypeOf(typeName: String, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that type of `actual` is not `typeName`.
     *
     * @param typeName - An unexpected type of an `actual` value.
     * @param options - Assertion options.
     */
    notTypeOf(typeName: String, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is strictly greater than `expected`.
     *
     * @param expected - A value that should be less than or equal to `actual`.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    gt(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is strictly greater than `expected`.
     *
     * @param expected - A value that should be less than or equal to `actual`.
     * @param options - Assertion options.
     */
    gt(expected: number, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is greater than or equal to `expected`.
     *
     * @param expected - A value that should be less than `actual`.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    gte(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is greater than or equal to `expected`.
     *
     * @param expected - A value that should be less than `actual`.
     * @param options - Assertion options.
     */
    gte(expected: number, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is less than `expected`.
     *
     * @param expected - A value that should be greater than or equal to `actual`.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    lt(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is less than `expected`.
     *
     * @param expected - A value that should be greater than or equal to `actual`.
     * @param options - Assertion options.
     */
    lt(expected: number, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is less than or equal to `expected`.
     *
     * @param expected - A value that should be greater than `actual`.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    lte(expected: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is less than or equal to `expected`.
     *
     * @param expected - A value that should be greater than `actual`.
     * @param options - Assertion options.
     */
    lte(expected: number, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is within a range from `start` to `finish`. Bounds are inclusive.
     *
     * @param start - A lower bound of range (included).
     * @param finish - An upper bound of range (included).
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    within(start: number, finish: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is within a range from `start` to `finish`. Bounds are inclusive.
     *
     * @param start - A lower bound of range (included).
     * @param finish - An upper bound of range (included).
     * @param options - Assertion options.
     */
    within(start: number, finish: number, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is not within a range from `start` to `finish`. Bounds are inclusive.
     *
     * @param start - A lower bound of range (included).
     * @param finish - An upper bound of range (included).
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    notWithin(start: number, finish: number, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` is not within a range from `start` to `finish`. Bounds are inclusive.
     *
     * @param start - A lower bound of range (included).
     * @param finish - An upper bound of range (included).
     * @param options - Assertion options.
     */
    notWithin(start: number, finish: number, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` matches the regular expression.
     *
     * @param re - A regular expression that is expected to be matched.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    match(re: RegExp, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` matches the regular expression.
     *
     * @param re - A regular expression that is expected to be matched.
     * @param options - Assertion options.
     */
    match(re: RegExp, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` does not match the regular expression.
     *
     * @param re - A regular expression that is expected to be matched.
     * @param message - An assertion message that will be displayed in the report if the test fails.
     * @param options - Assertion options.
     */
    notMatch(re: RegExp, message?: string, options?: AssertionOptions): TestControllerPromise;
    /**
     * Asserts that `actual` does not match the regular expression.
     *
     * @param re - A regular expression that is expected to be matched.
     * @param options - Assertion options.
     */
    notMatch(re: RegExp, options?: AssertionOptions): TestControllerPromise;

}

// Exportable lib
declare module 'testcafe' {
    /**
     * Creates a selector.
     *
     * @param init - Selector initializer.
     * @param options - Selector options.
     */
    export function Selector(init: string | ((...args: any[]) => Node | Node[] | NodeList | HTMLCollection) | Selector | NodeSnapshot | SelectorPromise,
                             options?: SelectorOptions): Selector;

    /**
     * Creates a client function.
     *
     * @param fn - Function code.
     * @param options - Function options.
     */
    export function ClientFunction(fn: Function, options?: ClientFunctionOptions): ClientFunction;

    export var Role: {
        /**
         * Creates a user role.
         *
         * @param url - The URL of the login page.
         * @param fn - An asynchronous function that contains logic that authenticates the user.
         * @param fn `t` - The test controller used to access test run API.
         * @param options - Role options.
         */
        (url: String, fn: (t: TestController) => Promise<any>, options?: RoleOptions): Role;
        /**
         * Creates an anonymous user role.
         */
        anonymous(): Role;
    };

    /**
     * The test controller used to access test run API.
     */
    export var t: TestController;
}


// Structure
//----------------------------------------------------------------------------
interface HTTPAuthCredentials {
    /**
     * The user name for the account.
     */
    username: string;
    /**
     * The password for the account.
     */
    password: string;
    /**
     * The domain name.
     */
    domain?: string;
    /**
     * The workstation's ID in the local network.
     */
    workstation?: string;
}

interface FixtureFn {
    /**
     * Declares a test fixture.
     *
     * @param name - The name of the fixture.
     */
    (name: string | TemplateStringsArray): this;
    /**
     * Specifies a webpage at which all tests in a fixture start.
     *
     * @param url - The URL of the webpage at this tests start.
     * To test webpages in local directories, you can use the `file://` scheme or relative paths.
     */
    page(url: string  | TemplateStringsArray): this;
    /**
     * Specifies HTTP Basic or Windows (NTLM) authentication credentials for all tests in the fixture.
     *
     * @param credentials - Contains credentials used for authentication.
     */
    httpAuth(credentials: HTTPAuthCredentials): this;
    /**
     * Specifies the fixture hook that is executed before the start of the first test in the fixture.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `ctx` - A fixture context object used to share variables between fixture hooks and test code.
     */
    before(fn: (ctx: {[key: string]: any}) => Promise<any>): this;
    /**
     * Specifies the fixture hook that is executed after the end of the last test in the fixture.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `ctx` - A fixture context object used to share variables between fixture hooks and test code.
     */
    after(fn: (ctx: {[key: string]: any}) => Promise<any>): this;
    /**
     * Specifies the hook that is executed on the start of each test in the fixture.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `t` - The test controller used to access test run API.
     */
    beforeEach(fn: (t: TestController) => Promise<any>): this;
    /**
     * Specifies the hook that is executed on the end of each test in the fixture.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `t` - The test controller used to access test run API.
     */
    afterEach(fn: (t: TestController) => Promise<any>): this;
    /**
     * Skips execution of all tests in the fixture.
     */
    skip: this;
    /**
     * Skips execution of all tests, except whose that are in this fixture.
     */
    only: this;
}

interface TestFn {
    /**
     * Declares a test.
     *
     * @param name - The name of the test.
     * @param fn - An asynchronous function that contains test code.
     * @param fn `t` - The test controller used to access test run API.
     */
    (name: string, fn: (t: TestController) => Promise<any>): this;
    /**
     * Specifies a webpage at which test starts.
     *
     * @param url - The URL of the webpage at which this test starts.
     * To test webpages in local directories, you can use the `file://` scheme or relative paths.
     */
    page(url: string): this;
    /**
     * Specifies HTTP Basic or Windows (NTLM) authentication credentials for the test.
     *
     * @param credentials - Contains credentials used for authentication.
     */
    httpAuth(credentials: HTTPAuthCredentials): this;
    /**
     * Specifies hook that is executed on the start of the test.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `t` - The test controller used to access test run API.
     */
    before(fn: (t: TestController) => Promise<any>): this;
    /**
     * Specifies hook that is executed on the end of the test.
     *
     * @param fn - An asynchronous hook function that contains initialization or clean-up code.
     * @param fn `t` - The test controller used to access test run API.
     */
    after(fn: (t: TestController) => Promise<any>): this;
    /**
     * Skips test execution.
     */
    skip: this;
    /**
     * Skips execution of all tests, except this one.
     */
    only: this;
}

declare var fixture: FixtureFn;
declare var test: TestFn;
