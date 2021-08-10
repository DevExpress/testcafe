import nativeMethods from '../native-methods';
import * as styleUtils from './style';


const NOT_CONTENT_EDITABLE_ELEMENTS_RE = /^(select|option|applet|area|audio|canvas|datalist|keygen|map|meter|object|progress|source|track|video|img)$/;
const INPUT_ELEMENTS_RE                = /^(input|textarea|button)$/;


// NOTE: save this classes in hammerhead and local native methods
const HTMLOptionElement     = window.HTMLOptionElement;
const ShadowRoot            = window.ShadowRoot;
const Text                  = window.Text;
const HTMLMapElement        = window.HTMLMapElement;
const HTMLAreaElement       = window.HTMLAreaElement;
const HTMLSelectElement     = window.HTMLSelectElement;
const ProcessingInstruction = window.ProcessingInstruction;


export function isSelectElement (el: unknown): el is HTMLSelectElement {
    return el instanceof HTMLSelectElement;
}

export function isShadowRoot (root: unknown): root is ShadowRoot {
    return root instanceof ShadowRoot;
}

export function isDomElement (el: unknown): el is Element {
    return el instanceof nativeMethods.elementClass;
}

export function isTextNode (node: unknown): node is Text {
    return node instanceof Text;
}

export function isOptionElement (el: unknown): el is HTMLOptionElement {
    return el instanceof HTMLOptionElement;
}

export function getTagName (el: Element): string {
    // NOTE: Check for tagName being a string, because it may be a function in an Angular app (T175340).
    return el && typeof el.tagName === 'string' ? el.tagName.toLowerCase() : '';
}

export function getActiveElement (): Element {
    let activeElement = document.activeElement || document.body; // eslint-disable-line no-restricted-properties

    while (activeElement.shadowRoot?.activeElement) // eslint-disable-line no-restricted-properties
        activeElement = activeElement.shadowRoot.activeElement; // eslint-disable-line no-restricted-properties

    return activeElement;
}

export function getSelectParent (el: Node): HTMLSelectElement | null {
    const parent = el.parentNode; // eslint-disable-line no-restricted-properties

    return closest(parent as Element, 'select') as HTMLSelectElement;
}

export function isOptionElementVisible (el: HTMLOptionElement): boolean {
    const parentSelect = getSelectParent(el);

    if (!parentSelect)
        return true;

    // const expanded        = isOptionListExpanded(parentSelect);
    // const selectSizeValue = styleUtils.getSelectElementSize(parentSelect);
    //
    // return expanded || selectSizeValue > 1;

    const selectSizeValue = styleUtils.getSelectElementSize(parentSelect);

    return selectSizeValue > 1;
}

export function isMapElement (el: unknown): el is HTMLMapElement | HTMLAreaElement {
    return el instanceof HTMLMapElement || el instanceof HTMLAreaElement;
}

export function isSVGElement (instance: any): instance is SVGElement {
    return instance instanceof nativeMethods.svgElementClass;
}

function isAlwaysNotEditableElement (el: Element): boolean {
    const tagName = getTagName(el);

    return !!tagName && (NOT_CONTENT_EDITABLE_ELEMENTS_RE.test(tagName) || INPUT_ELEMENTS_RE.test(tagName));
}

export function findDocument (el: Node): Document {
    if ('documentElement' in el)
        return el;

    if (el.ownerDocument && el.ownerDocument.defaultView)
        return el.ownerDocument;

    const parent = isElementNode(el) && el.parentNode; // eslint-disable-line no-restricted-properties

    return parent ? findDocument(parent) : document;
}

export function isContentEditableElement (el: Node): boolean {
    const element = isTextNode(el) ? el.parentElement || el.parentNode : el; // eslint-disable-line no-restricted-properties

    if (!element)
        return false;

    // @ts-ignore
    const isContentEditable = element.isContentEditable &&
        !isAlwaysNotEditableElement(element as Element);

    return isRenderedNode(element) && (isContentEditable || findDocument(el).designMode === 'on');
}

export function closest (el: Element, selector: string): Element | null {
    if (!isElementNode(el))
        return null;

    return nativeMethods.closest.call(el, selector);
}

export function getMapContainer (el: HTMLElement): Element | null {
    const closestMap        = closest(el, 'map');
    const closestMapName    = nativeMethods.getAttribute.call(closestMap, 'name');
    const containerSelector = '[usemap="#' + closestMapName + '"]';

    return nativeMethods.querySelector.call(findDocument(el), containerSelector);
}

export function getSelectVisibleChildren (select: HTMLSelectElement): Node[] {
    const collection = nativeMethods.querySelectorAll.call(select, 'optgroup, option');

    return Array.prototype.slice.call(collection);
}

export function getChildVisibleIndex (select: HTMLSelectElement, child: Node): number {
    const childrenArray = getSelectVisibleChildren(select);

    return childrenArray.indexOf(child);
}

export function findParent (node: Node, includeSelf: boolean, predicate: (el: Node) => boolean): Node | null {
    let resultNode = includeSelf ? node : node.parentNode; // eslint-disable-line no-restricted-properties

    if (typeof predicate !== 'function')
        return resultNode;

    while (resultNode) {
        if (predicate(resultNode))
            return resultNode;

        resultNode = resultNode.parentNode; // eslint-disable-line no-restricted-properties
    }

    return null;
}

export function isElementNode (node: Node | null): node is Element {
    return !!node && node.nodeType === nativeMethods.Node.ELEMENT_NODE;
}

export function isRenderedNode (node: Node): boolean {
    const nodeName = node.nodeName;

    return !(node instanceof ProcessingInstruction) && nodeName !== '#comment' && nodeName !== 'SCRIPT' && nodeName !== 'STYLE';
}

let scrollbarSize = NaN;

export function getScrollbarSize (): number {
    if (!isNaN(scrollbarSize))
        return scrollbarSize;

    const scrollDiv = document.createElement('div');

    scrollDiv.style.height   = '100px';
    scrollDiv.style.overflow = 'scroll';
    scrollDiv.style.position = 'absolute';
    scrollDiv.style.top      = '-9999px';
    scrollDiv.style.width    = '100px';

    document.body.appendChild(scrollDiv);

    scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;

    document.body.removeChild(scrollDiv);

    return scrollbarSize;
}

export function isElementInIframe (el: Element | Document, currentDocument?: Document): boolean {
    const doc = currentDocument || findDocument(el);

    return window.document !== doc;
}

export function isWindow (el: Node | Window | Document): el is Window {
    return 'pageYOffset' in el;
}

export function isDocument (el: Node | Window | Document): el is Document {
    return 'defaultView' in el;
}

function getFrameElement (win: Window): HTMLFrameElement | HTMLIFrameElement | null {
    try {
        return win.frameElement as HTMLFrameElement | HTMLIFrameElement;
    }
    catch (e) {
        return null;
    }
}

export function getIframeByElement (el: HTMLElement | Document): HTMLFrameElement | HTMLIFrameElement | null {
    const doc = isDocument(el) ? el : el.ownerDocument;
    const win = doc.defaultView;

    return win && getFrameElement(win);
}

export function isSVGElementOrChild (el: Element): el is SVGElement {
    return !!closest(el, 'svg');
}
