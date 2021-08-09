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
    isTextNode (el: unknown): boolean;
    isMapElement (el: unknown): el is HTMLMapElement | HTMLAreaElement;
    isSVGElement (el: unknown): el is SVGElement;
    isContentEditableElement (el: unknown): boolean;
    closest (el: Element, selector: string): Element | null;
    getMapContainer (el: Element | null): Element | null;
    getSelectParent (el: Element): HTMLSelectElement | null;
    getChildVisibleIndex (select: HTMLSelectElement, child: Node): number;
    getElementRectangle (el: Node): ElementRectangle;
    findParent (node: Node, includeSelf: boolean, predicate: (el: Node) => boolean): Node | null;
    isElementNode (el: Node): el is Element;
    getStyle (el: Node, property: keyof CSSStyleDeclaration): string | null;
    isRenderedNode (node: Node): boolean;
    isSelectVisibleChild (el: Node): el is HTMLElement;
    getScrollTop (el: Window | Document | Element | null): number;
    getOptionHeight (el: Element): number;
    getSelectElementSize (select: HTMLSelectElement): number;
}
