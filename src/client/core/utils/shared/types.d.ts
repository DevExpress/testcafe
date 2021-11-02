import { BoundaryValuesData } from './values/boundary-values';
import { AxisValuesData, LeftTopValues } from './values/axis-values';

export interface ElementRectangle {
    height: number;
    left: number;
    top: number;
    width: number;
}

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
    getAttribute: Element['getAttribute'];
    querySelector: HTMLElement['querySelector'];
    querySelectorAll: HTMLElement['querySelectorAll'];
}

export interface CoreUtilsAdapter {
    nativeMethods: NativeMethods;
    browser: {
        isIE?: boolean;
        isChrome?: boolean;
        isFirefox?: boolean;
    };

    dom: {
        isTextNode (el: unknown): boolean;
        isMapElement (el: unknown): el is HTMLMapElement | HTMLAreaElement;
        isSVGElement (el: unknown): el is SVGElement;
        isContentEditableElement (el: unknown): boolean;
        closest (el: Element, selector: string): Element | null;
        getMapContainer (el: Element | null): Element | null;
        getSelectParent (el: Element): HTMLSelectElement | null;
        getChildVisibleIndex (select: HTMLSelectElement, child: Node): number;
        findParent (node: Node, includeSelf: boolean, predicate: (el: Node) => boolean): Node | null;
        isElementNode (el: Node): el is Element;
        isBodyElement (el: unknown): el is HTMLBodyElement;
        isHtmlElement (el: unknown): el is HTMLHtmlElement;
        isRenderedNode (node: Node): boolean;
        findDocument (el: Node): Document;
        isElementInIframe (el: Element | Document, currentDocument?: Document): boolean;
        getIframeByElement (el: Element | Document): HTMLFrameElement | HTMLIFrameElement | null;
        getParents (el: Element, selector?: string): Element[];
        getScrollbarSize (): number;
    };

    style: {
        get (el: Node, property: keyof CSSStyleDeclaration): string | null;
        isSelectVisibleChild (el: Node): el is HTMLElement;
        getScrollTop (el: Window | Document | Element | null): number;
        getOptionHeight (el: Element): number;
        getSelectElementSize (select: HTMLSelectElement): number;
        getBordersWidth (el: Element): BoundaryValuesData;
        getElementScroll (el: Window | Document | Element): LeftTopValues<number>;
        getInnerWidth (el: Element | Window | Document | null): number;
        getInnerHeight (el: Element | Window | Document | null): number;
        getScrollLeft (el: Window | Document | Element | null): number;
    };

    position: {
        getElementRectangle (el: Node): ElementRectangle;
        getOffsetPosition (el: Element | Document, roundFn?: (n: number) => number): LeftTopValues<number>;
        offsetToClientCoords (coords: AxisValuesData<number>, currentDocument?: Document): AxisValuesData<number>;
    };
}
