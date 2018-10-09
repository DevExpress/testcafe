/* global isIFrameWithoutSrc:true */
import hammerhead from '../deps/hammerhead';
import * as styleUtils from './style';
import * as domUtils from './dom';


export const getElementRectangle  = hammerhead.utils.position.getElementRectangle;
export const getOffsetPosition    = hammerhead.utils.position.getOffsetPosition;
export const offsetToClientCoords = hammerhead.utils.position.offsetToClientCoords;

export function getIframeClientCoordinates (iframe) {
    const { left, top }       = getOffsetPosition(iframe);
    const clientPosition      = offsetToClientCoords({ x: left, y: top });
    const iframeBorders       = styleUtils.getBordersWidth(iframe);
    const iframePadding       = styleUtils.getElementPadding(iframe);
    const iframeRectangleLeft = clientPosition.x + iframeBorders.left + iframePadding.left;
    const iframeRectangleTop  = clientPosition.y + iframeBorders.top + iframePadding.top;

    return {
        left:   iframeRectangleLeft,
        top:    iframeRectangleTop,
        right:  iframeRectangleLeft + styleUtils.getWidth(iframe),
        bottom: iframeRectangleTop + styleUtils.getHeight(iframe)
    };
}

export function isElementVisible (el) {
    if (domUtils.isTextNode(el))
        return !styleUtils.isNotVisibleNode(el);

    const elementRectangle = getElementRectangle(el);

    if (!domUtils.isContentEditableElement(el)) {
        if (elementRectangle.width === 0 || elementRectangle.height === 0)
            return false;
    }

    if (domUtils.isMapElement(el)) {
        const mapContainer = domUtils.getMapContainer(domUtils.closest(el, 'map'));

        return mapContainer ? isElementVisible(mapContainer) : false;
    }

    if (styleUtils.isSelectVisibleChild(el)) {
        const select              = domUtils.getSelectParent(el);
        const childRealIndex      = domUtils.getChildVisibleIndex(select, el);
        const realSelectSizeValue = styleUtils.getSelectElementSize(select);
        const topVisibleIndex     = Math.max(styleUtils.getScrollTop(select) / styleUtils.getOptionHeight(select), 0);
        const bottomVisibleIndex  = topVisibleIndex + realSelectSizeValue - 1;
        const optionVisibleIndex  = Math.max(childRealIndex - topVisibleIndex, 0);

        return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
    }

    if (domUtils.isSVGElement(el))
        return styleUtils.get(el, 'visibility') !== 'hidden' && styleUtils.get(el, 'display') !== 'none';

    return styleUtils.hasDimensions(el) && styleUtils.get(el, 'visibility') !== 'hidden';
}

export function getClientDimensions (target) {
    if (!domUtils.isDomElement(target)) {
        const clientPoint = offsetToClientCoords(target);

        return {
            width:  0,
            height: 0,

            border: {
                bottom: 0,
                left:   0,
                right:  0,
                top:    0
            },
            scroll: {
                left: 0,
                top:  0
            },

            left:   clientPoint.x,
            right:  clientPoint.x,
            top:    clientPoint.y,
            bottom: clientPoint.y
        };
    }

    const isHtmlElement       = /html/i.test(target.tagName);
    const body                = isHtmlElement ? target.getElementsByTagName('body')[0] : null;
    const elementBorders      = styleUtils.getBordersWidth(target);
    const elementRect         = target.getBoundingClientRect();
    const elementScroll       = styleUtils.getElementScroll(target);
    const isElementInIframe   = domUtils.isElementInIframe(target);
    let elementLeftPosition = isHtmlElement ? 0 : elementRect.left;
    let elementTopPosition  = isHtmlElement ? 0 : elementRect.top;
    let elementHeight       = isHtmlElement ? target.clientHeight : elementRect.height;
    let elementWidth        = isHtmlElement ? target.clientWidth : elementRect.width;
    const isCompatMode        = target.ownerDocument.compatMode === 'BackCompat';

    if (isHtmlElement && body && (typeof isIFrameWithoutSrc === 'boolean' && isIFrameWithoutSrc || isCompatMode)) {
        elementHeight = body.clientHeight;
        elementWidth  = body.clientWidth;
    }

    if (isElementInIframe) {
        const iframeElement = domUtils.getIframeByElement(target);

        if (iframeElement) {
            const iframeOffset  = getOffsetPosition(iframeElement);
            const clientOffset  = offsetToClientCoords({
                x: iframeOffset.left,
                y: iframeOffset.top
            });
            const iframeBorders = styleUtils.getBordersWidth(iframeElement);

            elementLeftPosition += clientOffset.x + iframeBorders.left;
            elementTopPosition += clientOffset.y + iframeBorders.top;

            if (isHtmlElement) {
                elementBorders.bottom += iframeBorders.bottom;
                elementBorders.left += iframeBorders.left;
                elementBorders.right += iframeBorders.right;
                elementBorders.top += iframeBorders.top;
            }
        }
    }

    const hasRightScrollbar   = !isHtmlElement && styleUtils.getInnerWidth(target) !== target.clientWidth;
    const rightScrollbarWidth = hasRightScrollbar ? domUtils.getScrollbarSize() : 0;

    const hasBottomScrollbar    = !isHtmlElement && styleUtils.getInnerHeight(target) !== target.clientHeight;
    const bottomScrollbarHeight = hasBottomScrollbar ? domUtils.getScrollbarSize() : 0;

    return {
        width:  elementWidth,
        height: elementHeight,
        left:   elementLeftPosition,
        top:    elementTopPosition,
        border: elementBorders,
        bottom: elementTopPosition + elementHeight,
        right:  elementLeftPosition + elementWidth,

        scroll: {
            left: elementScroll.left,
            top:  elementScroll.top
        },

        scrollbar: {
            right:  rightScrollbarWidth,
            bottom: bottomScrollbarHeight
        }
    };
}

export function containsOffset (el, offsetX, offsetY) {
    const dimensions = getClientDimensions(el);
    const width      = Math.max(el.scrollWidth, dimensions.width);
    const height     = Math.max(el.scrollHeight, dimensions.height);
    const maxX       = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + width;
    const maxY       = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + height;

    return (typeof offsetX === 'undefined' || offsetX >= 0 && maxX >= offsetX) &&
           (typeof offsetY === 'undefined' || offsetY >= 0 && maxY >= offsetY);
}

export function getEventAbsoluteCoordinates (ev) {
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

    return {
        x: pageCoordinates.x + xOffset,
        y: pageCoordinates.y + yOffset
    };
}

export function getEventPageCoordinates (ev) {
    const curCoordObject = /^touch/.test(ev.type) && ev.targetTouches ? ev.targetTouches[0] || ev.changedTouches[0] : ev;

    const bothPageCoordinatesAreZero      = curCoordObject.pageX === 0 && curCoordObject.pageY === 0;
    const notBothClientCoordinatesAreZero = curCoordObject.clientX !== 0 || curCoordObject.clientY !== 0;

    if ((curCoordObject.pageX === null || bothPageCoordinatesAreZero && notBothClientCoordinatesAreZero) &&
        curCoordObject.clientX !== null) {
        const currentDocument = domUtils.findDocument(ev.target || ev.srcElement);
        const html            = currentDocument.documentElement;
        const body            = currentDocument.body;

        return {
            x: Math.round(curCoordObject.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) -
                          (html.clientLeft || 0)),
            y: Math.round(curCoordObject.clientY + (html && html.scrollTop || body && body.scrollTop || 0) -
                          (html.clientTop || 0))
        };
    }
    return {
        x: Math.round(curCoordObject.pageX),
        y: Math.round(curCoordObject.pageY)
    };
}

export function getElementFromPoint (x, y) {
    let el   = null;
    const func = document.getElementFromPoint || document.elementFromPoint;

    try {
        // Permission denied to access property 'getElementFromPoint' error in iframe
        el = func.call(document, x, y);
    }
    catch (ex) {
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

export function getIframePointRelativeToParentFrame (pos, iframeWin) {
    const iframe        = domUtils.findIframeByWindow(iframeWin);
    const iframeOffset  = getOffsetPosition(iframe);
    const iframeBorders = styleUtils.getBordersWidth(iframe);
    const iframePadding = styleUtils.getElementPadding(iframe);

    return offsetToClientCoords({
        x: pos.x + iframeOffset.left + iframeBorders.left + iframePadding.left,
        y: pos.y + iframeOffset.top + iframeBorders.top + iframePadding.top
    });
}

export function clientToOffsetCoord (coords, currentDocument) {
    const doc = currentDocument || document;

    return {
        x: coords.x + styleUtils.getScrollLeft(doc),
        y: coords.y + styleUtils.getScrollTop(doc)
    };
}

export function findCenter (el) {
    const rectangle = getElementRectangle(el);

    return {
        x: Math.round(rectangle.left + rectangle.width / 2),
        y: Math.round(rectangle.top + rectangle.height / 2)
    };
}

export function getClientPosition (el) {
    const { left, top } = getOffsetPosition(el);

    const clientCoords = offsetToClientCoords({ x: left, y: top });

    clientCoords.x = Math.round(clientCoords.x);
    clientCoords.y = Math.round(clientCoords.y);

    return clientCoords;
}

export function getElementClientRectangle (el) {
    const rect      = getElementRectangle(el);
    const clientPos = offsetToClientCoords({
        x: rect.left,
        y: rect.top
    });

    return {
        height: rect.height,
        left:   clientPos.x,
        top:    clientPos.y,
        width:  rect.width
    };
}

export function calcRelativePosition (dimensions, toDimensions) {
    return {
        left: Math.ceil(dimensions.left - (toDimensions.left + toDimensions.border.left)),

        right: Math.floor(toDimensions.right - toDimensions.border.right - toDimensions.scrollbar.right -
                          dimensions.right),

        top: Math.ceil(dimensions.top - (toDimensions.top + toDimensions.border.top)),

        bottom: Math.floor(toDimensions.bottom - toDimensions.border.bottom - toDimensions.scrollbar.bottom -
                           dimensions.bottom)
    };
}

export function isInRectangle ({ x, y }, rectangle) {
    return x >= rectangle.left && x <= rectangle.right && y >= rectangle.top && y <= rectangle.bottom;
}

export function getLineYByXCoord (startLinePoint, endLinePoint, x) {
    if (endLinePoint.x - startLinePoint.x === 0)
        return null;

    const equationSlope = (endLinePoint.y - startLinePoint.y) / (endLinePoint.x - startLinePoint.x);

    const equationYIntercept = startLinePoint.x * (startLinePoint.y - endLinePoint.y) /
                             (endLinePoint.x - startLinePoint.x) + startLinePoint.y;

    return Math.round(equationSlope * x + equationYIntercept);
}

export function getLineXByYCoord (startLinePoint, endLinePoint, y) {
    if (endLinePoint.y - startLinePoint.y === 0)
        return null;

    const equationSlope = (endLinePoint.x - startLinePoint.x) / (endLinePoint.y - startLinePoint.y);

    const equationXIntercept = startLinePoint.y * (startLinePoint.x - endLinePoint.x) /
                             (endLinePoint.y - startLinePoint.y) + startLinePoint.x;

    return Math.round(equationSlope * y + equationXIntercept);

}
