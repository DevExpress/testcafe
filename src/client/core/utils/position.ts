import hammerhead from '../deps/hammerhead';
import * as styleUtils from './style';
import * as domUtils from './dom';
import AxisValues, { AxisValuesData } from './values/axis-values';
import BoundaryValues, { BoundaryValuesData } from './values/boundary-values';
import Dimensions from './values/dimensions';


export const getElementRectangle  = hammerhead.utils.position.getElementRectangle;
export const getOffsetPosition    = hammerhead.utils.position.getOffsetPosition;
export const offsetToClientCoords = hammerhead.utils.position.offsetToClientCoords;

export function getClientDimensions (target: HTMLElement): Dimensions {
    const isHtmlElement     = domUtils.isHtmlElement(target);
    const body              = isHtmlElement ? target.getElementsByTagName('body')[0] : null;
    const elementRect       = target.getBoundingClientRect();
    const elBorders         = BoundaryValues.create(styleUtils.getBordersWidth(target));
    const elScroll          = styleUtils.getElementScroll(target);
    const isElementInIframe = domUtils.isElementInIframe(target);
    const isCompatMode      = target.ownerDocument.compatMode === 'BackCompat';
    const elPosition        = isHtmlElement ? new AxisValues(0, 0) : AxisValues.create(elementRect);

    let elHeight   = elementRect.height;
    let elWidth    = elementRect.width;

    if (isHtmlElement) {
        if (body && isCompatMode) {
            elHeight = body.clientHeight;
            elWidth  = body.clientWidth;
        }
        else {
            elHeight = target.clientHeight;
            elWidth  = target.clientWidth;
        }
    }

    if (isElementInIframe) {
        const iframeElement = domUtils.getIframeByElement(target);

        if (iframeElement) {
            const iframeOffset  = getOffsetPosition(iframeElement);
            const clientOffset  = offsetToClientCoords(AxisValues.create(iframeOffset));
            const iframeBorders = styleUtils.getBordersWidth(iframeElement);

            elPosition.add(clientOffset).add(AxisValues.create(iframeBorders));

            if (isHtmlElement)
                elBorders.add(iframeBorders);
        }
    }

    const hasRightScrollbar  = !isHtmlElement && styleUtils.getInnerWidth(target) !== target.clientWidth;
    const hasBottomScrollbar = !isHtmlElement && styleUtils.getInnerHeight(target) !== target.clientHeight;

    const scrollbar = {
        right:  hasRightScrollbar ? domUtils.getScrollbarSize() : 0,
        bottom: hasBottomScrollbar ? domUtils.getScrollbarSize() : 0,
    };

    return new Dimensions(elWidth, elHeight, elPosition, elBorders, elScroll, scrollbar);
}

export function getElementFromPoint ({ x, y }: AxisValuesData<number>): Element | null {
    // @ts-ignore
    const ieFn = document.getElementFromPoint;
    const func = ieFn || document.elementFromPoint;

    let el: Element | null = null;

    try {
        // Permission denied to access property 'getElementFromPoint' error in iframe
        el = func.call(document, x, y);
    }
    catch {
        return null;
    }

    //NOTE: elementFromPoint returns null when is's a border of an iframe
    if (el === null)
        el = func.call(document, x - 1, y - 1);

    while (el && el.shadowRoot && el.shadowRoot.elementFromPoint) {
        const shadowEl = el.shadowRoot.elementFromPoint(x, y);

        if (!shadowEl || el === shadowEl)
            break;

        el = shadowEl;
    }

    return el;
}

export function calcRelativePosition (dimensions: Dimensions, toDimensions: Dimensions): BoundaryValuesData {
    const pos = BoundaryValues.create({
        top:    dimensions.top - toDimensions.top,
        left:   dimensions.left - toDimensions.left,
        right:  toDimensions.right - dimensions.right,
        bottom: toDimensions.bottom - dimensions.bottom,
    });

    return pos.sub(toDimensions.border).sub(toDimensions.scrollbar).round(Math.ceil, Math.floor);
}

export function getIframeClientCoordinates (iframe: HTMLIFrameElement): BoundaryValues {
    const { left, top }       = getOffsetPosition(iframe);
    const clientPosition      = offsetToClientCoords({ x: left, y: top });
    const iframeBorders       = styleUtils.getBordersWidth(iframe);
    const iframePadding       = styleUtils.getElementPadding(iframe);
    const iframeRectangleLeft = clientPosition.x + iframeBorders.left + iframePadding.left;
    const iframeRectangleTop  = clientPosition.y + iframeBorders.top + iframePadding.top;

    return new BoundaryValues(iframeRectangleTop,
        iframeRectangleLeft + styleUtils.getWidth(iframe),
        iframeRectangleTop + styleUtils.getHeight(iframe),
        iframeRectangleLeft);
}

export function containsOffset (el: HTMLElement, offsetX?: number, offsetY?: number): boolean {
    const dimensions = getClientDimensions(el);
    const width      = Math.max(el.scrollWidth, dimensions.width);
    const height     = Math.max(el.scrollHeight, dimensions.height);
    const maxX       = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + width;
    const maxY       = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + height;

    return (typeof offsetX === 'undefined' || offsetX >= 0 && maxX >= offsetX) &&
           (typeof offsetY === 'undefined' || offsetY >= 0 && maxY >= offsetY);
}

export function getEventAbsoluteCoordinates (ev: MouseEvent): AxisValues<number> {
    const el              = ev.target || ev.srcElement;
    const pageCoordinates = getEventPageCoordinates(ev);
    const curDocument     = domUtils.findDocument(el);
    let xOffset         = 0;
    let yOffset         = 0;

    if (domUtils.isElementInIframe(curDocument.documentElement)) {
        const currentIframe = domUtils.getIframeByElement(curDocument);

        if (currentIframe) {
            const iframeOffset  = getOffsetPosition(currentIframe);
            const iframeBorders = styleUtils.getBordersWidth(currentIframe);

            xOffset = iframeOffset.left + iframeBorders.left;
            yOffset = iframeOffset.top + iframeBorders.top;
        }
    }

    return new AxisValues(pageCoordinates.x + xOffset, pageCoordinates.y + yOffset);
}

export function getEventPageCoordinates (ev: MouseEvent): AxisValues<number> {
    const curCoordObject = /^touch/.test(ev.type) && (ev as unknown as TouchEvent).targetTouches ? (ev as unknown as TouchEvent).targetTouches[0] || (ev as unknown as TouchEvent).changedTouches[0] : ev;

    const bothPageCoordinatesAreZero      = curCoordObject.pageX === 0 && curCoordObject.pageY === 0;
    const notBothClientCoordinatesAreZero = curCoordObject.clientX !== 0 || curCoordObject.clientY !== 0;

    if ((curCoordObject.pageX === null || bothPageCoordinatesAreZero && notBothClientCoordinatesAreZero) &&
        curCoordObject.clientX !== null) {
        const currentDocument = domUtils.findDocument(ev.target || ev.srcElement);
        const html            = currentDocument.documentElement;
        const body            = currentDocument.body;

        return new AxisValues<number>(
            Math.round(curCoordObject.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) -
                (html.clientLeft || 0)),
            Math.round(curCoordObject.clientY + (html && html.scrollTop || body && body.scrollTop || 0) -
                (html.clientTop || 0))
        );
    }
    return new AxisValues<number>(
        Math.round(curCoordObject.pageX),
        Math.round(curCoordObject.pageY)
    );
}

export function getIframePointRelativeToParentFrame (pos: AxisValues<number>, iframeWin: Window): AxisValues<number> {
    const iframe        = domUtils.findIframeByWindow(iframeWin);
    const iframeOffset  = getOffsetPosition(iframe);
    const iframeBorders = styleUtils.getBordersWidth(iframe);
    const iframePadding = styleUtils.getElementPadding(iframe);

    return offsetToClientCoords({
        x: pos.x + iframeOffset.left + iframeBorders.left + iframePadding.left,
        y: pos.y + iframeOffset.top + iframeBorders.top + iframePadding.top,
    });
}

export function findCenter (el: HTMLElement): AxisValues<number> {
    const rectangle = getElementRectangle(el);

    return new AxisValues<number>(
        Math.round(rectangle.left + rectangle.width / 2),
        Math.round(rectangle.top + rectangle.height / 2),
    );
}

export function getClientPosition (el: HTMLElement): any {
    const { left, top } = getOffsetPosition(el);

    const clientCoords = offsetToClientCoords({ x: left, y: top });

    clientCoords.x = Math.round(clientCoords.x);
    clientCoords.y = Math.round(clientCoords.y);

    return clientCoords;
}

export function isInRectangle ({ x, y }: AxisValues<number>, rectangle: BoundaryValues): boolean {
    return x >= rectangle.left && x <= rectangle.right && y >= rectangle.top && y <= rectangle.bottom;
}

export function getWindowPosition (): AxisValues<number> {
    const x = window.screenLeft || window.screenX;
    const y = window.screenTop || window.screenY;

    return new AxisValues(x, y);
}

export function isIframeVisible (el: Node): boolean {
    return !hiddenUsingStyles(el as HTMLElement);
}

function hiddenUsingStyles (el: HTMLElement): boolean {
    return styleUtils.get(el, 'visibility') === 'hidden' ||
        styleUtils.get(el, 'display') === 'none';
}

function hiddenByRectangle (el: HTMLElement): boolean {
    const elementRectangle = getElementRectangle(el);

    return elementRectangle.width === 0 ||
        elementRectangle.height === 0;
}

export function isElementVisible (el: Node): boolean {
    if (domUtils.isTextNode(el))
        return !styleUtils.isNotVisibleNode(el);

    if (!domUtils.isContentEditableElement(el) &&
        !domUtils.isSVGElement(el) &&
        hiddenByRectangle(el as HTMLElement))
        return false;

    if (domUtils.isMapElement(el)) {
        const mapContainer = domUtils.getMapContainer(domUtils.closest(el, 'map'));

        return mapContainer ? isElementVisible(mapContainer) : false;
    }

    if (styleUtils.isSelectVisibleChild(el)) {
        const select              = domUtils.getSelectParent(el) as HTMLSelectElement;
        const childRealIndex      = domUtils.getChildVisibleIndex(select, el);
        const realSelectSizeValue = styleUtils.getSelectElementSize(select);
        const topVisibleIndex     = Math.max(styleUtils.getScrollTop(select) / styleUtils.getOptionHeight(select), 0);
        const bottomVisibleIndex  = topVisibleIndex + realSelectSizeValue - 1;
        const optionVisibleIndex  = Math.max(childRealIndex - topVisibleIndex, 0);

        return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
    }

    if (domUtils.isSVGElement(el)) {
        const hiddenParent = domUtils.findParent(el, true, (parent: Node) => {
            return hiddenUsingStyles(parent as unknown as HTMLElement);
        });

        if (!hiddenParent)
            return !hiddenByRectangle(el as unknown as HTMLElement);

        return false;
    }

    return styleUtils.hasDimensions(el as HTMLElement) && !hiddenUsingStyles(el as unknown as HTMLElement);
}

