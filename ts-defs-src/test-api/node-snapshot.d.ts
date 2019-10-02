
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
