/* global isIFrameWithoutSrc:true */
import hammerhead from '../deps/hammerhead';
import * as styleUtils from './style';
import * as domUtils from './dom';


export var getElementRectangle  = hammerhead.utils.position.getElementRectangle;
export var getOffsetPosition    = hammerhead.utils.position.getOffsetPosition;
export var offsetToClientCoords = hammerhead.utils.position.offsetToClientCoords;

export function getIframeClientCoordinates (iframe) {
    var { left, top }       = getOffsetPosition(iframe);
    var clientPosition      = offsetToClientCoords({ x: left, y: top });
    var iframeBorders       = styleUtils.getBordersWidth(iframe);
    var iframePadding       = styleUtils.getElementPadding(iframe);
    var iframeRectangleLeft = clientPosition.x + iframeBorders.left + iframePadding.left;
    var iframeRectangleTop  = clientPosition.y + iframeBorders.top + iframePadding.top;

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

    var elementRectangle = getElementRectangle(el);

    if (!domUtils.isContentEditableElement(el)) {
        if (elementRectangle.width === 0 || elementRectangle.height === 0)
            return false;
    }

    if (domUtils.isMapElement(el)) {
        var mapContainer = domUtils.getMapContainer(domUtils.closest(el, 'map'));

        return mapContainer ? isElementVisible(mapContainer) : false;
    }

    if (styleUtils.isSelectVisibleChild(el)) {
        var select              = domUtils.getSelectParent(el);
        var childRealIndex      = domUtils.getChildVisibleIndex(select, el);
        var realSelectSizeValue = styleUtils.getSelectElementSize(select);
        var topVisibleIndex     = Math.max(styleUtils.getScrollTop(select) / styleUtils.getOptionHeight(select), 0);
        var bottomVisibleIndex  = topVisibleIndex + realSelectSizeValue - 1;
        var optionVisibleIndex  = Math.max(childRealIndex - topVisibleIndex, 0);

        return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
    }

    if (domUtils.isSVGElement(el))
        return styleUtils.get(el, 'visibility') !== 'hidden' && styleUtils.get(el, 'display') !== 'none';

    return styleUtils.hasDimensions(el) && styleUtils.get(el, 'visibility') !== 'hidden';
}

export function getClientDimensions (target) {
    if (!domUtils.isDomElement(target)) {
        var clientPoint = offsetToClientCoords(target);

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

    var isHtmlElement       = /html/i.test(target.tagName);
    var body                = isHtmlElement ? target.getElementsByTagName('body')[0] : null;
    var elementBorders      = styleUtils.getBordersWidth(target);
    var elementRect         = target.getBoundingClientRect();
    var elementScroll       = styleUtils.getElementScroll(target);
    var isElementInIframe   = domUtils.isElementInIframe(target);
    var elementLeftPosition = isHtmlElement ? 0 : elementRect.left;
    var elementTopPosition  = isHtmlElement ? 0 : elementRect.top;
    var elementHeight       = isHtmlElement ? target.clientHeight : elementRect.height;
    var elementWidth        = isHtmlElement ? target.clientWidth : elementRect.width;
    var isCompatMode        = target.ownerDocument.compatMode === 'BackCompat';

    if (isHtmlElement && body && (typeof isIFrameWithoutSrc === 'boolean' && isIFrameWithoutSrc || isCompatMode)) {
        elementHeight = body.clientHeight;
        elementWidth  = body.clientWidth;
    }

    if (isElementInIframe) {
        var iframeElement = domUtils.getIframeByElement(target);

        if (iframeElement) {
            var iframeOffset  = getOffsetPosition(iframeElement);
            var clientOffset  = offsetToClientCoords({
                x: iframeOffset.left,
                y: iframeOffset.top
            });
            var iframeBorders = styleUtils.getBordersWidth(iframeElement);

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
    var dimensions = getClientDimensions(el);
    var width      = Math.max(el.scrollWidth, dimensions.width);
    var height     = Math.max(el.scrollHeight, dimensions.height);
    var maxX       = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + width;
    var maxY       = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + height;

    return (typeof offsetX === 'undefined' || offsetX >= 0 && maxX >= offsetX) &&
           (typeof offsetY === 'undefined' || offsetY >= 0 && maxY >= offsetY);
}

export function getEventAbsoluteCoordinates (ev) {
    var el              = ev.target || ev.srcElement;
    var pageCoordinates = getEventPageCoordinates(ev);
    var curDocument     = domUtils.findDocument(el);
    var xOffset         = 0;
    var yOffset         = 0;

    if (domUtils.isElementInIframe(curDocument.documentElement)) {
        var currentIframe = domUtils.getIframeByElement(curDocument);

        if (currentIframe) {
            var iframeOffset  = getOffsetPosition(currentIframe);
            var iframeBorders = styleUtils.getBordersWidth(currentIframe);

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
    var curCoordObject = /^touch/.test(ev.type) && ev.targetTouches ? ev.targetTouches[0] || ev.changedTouches[0] : ev;

    var bothPageCoordinatesAreZero      = curCoordObject.pageX === 0 && curCoordObject.pageY === 0;
    var notBothClientCoordinatesAreZero = curCoordObject.clientX !== 0 || curCoordObject.clientY !== 0;

    if ((curCoordObject.pageX === null || bothPageCoordinatesAreZero && notBothClientCoordinatesAreZero) &&
        curCoordObject.clientX !== null) {
        var currentDocument = domUtils.findDocument(ev.target || ev.srcElement);
        var html            = currentDocument.documentElement;
        var body            = currentDocument.body;

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
    var el   = null;
    var func = document.getElementFromPoint || document.elementFromPoint;

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
        var shadowEl = el.shadowRoot.elementFromPoint(x, y);

        if (!shadowEl)
            break;

        el = shadowEl;
    }

    return el;
}

export function getIframePointRelativeToParentFrame (pos, iframeWin) {
    var iframe        = domUtils.findIframeByWindow(iframeWin);
    var iframeOffset  = getOffsetPosition(iframe);
    var iframeBorders = styleUtils.getBordersWidth(iframe);
    var iframePadding = styleUtils.getElementPadding(iframe);

    return offsetToClientCoords({
        x: pos.x + iframeOffset.left + iframeBorders.left + iframePadding.left,
        y: pos.y + iframeOffset.top + iframeBorders.top + iframePadding.top
    });
}

export function clientToOffsetCoord (coords, currentDocument) {
    var doc = currentDocument || document;

    return {
        x: coords.x + styleUtils.getScrollLeft(doc),
        y: coords.y + styleUtils.getScrollTop(doc)
    };
}

export function findCenter (el) {
    var rectangle = getElementRectangle(el);

    return {
        x: Math.round(rectangle.left + rectangle.width / 2),
        y: Math.round(rectangle.top + rectangle.height / 2)
    };
}

export function getClientPosition (el) {
    var { left, top } = getOffsetPosition(el);

    var clientCoords = offsetToClientCoords({ x: left, y: top });

    clientCoords.x = Math.round(clientCoords.x);
    clientCoords.y = Math.round(clientCoords.y);

    return clientCoords;
}

export function getElementClientRectangle (el) {
    var rect      = getElementRectangle(el);
    var clientPos = offsetToClientCoords({
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

    var equationSlope = (endLinePoint.y - startLinePoint.y) / (endLinePoint.x - startLinePoint.x);

    var equationYIntercept = startLinePoint.x * (startLinePoint.y - endLinePoint.y) /
                             (endLinePoint.x - startLinePoint.x) + startLinePoint.y;

    return Math.round(equationSlope * x + equationYIntercept);
}

export function getLineXByYCoord (startLinePoint, endLinePoint, y) {
    if (endLinePoint.y - startLinePoint.y === 0)
        return null;

    var equationSlope = (endLinePoint.x - startLinePoint.x) / (endLinePoint.y - startLinePoint.y);

    var equationXIntercept = startLinePoint.y * (startLinePoint.x - endLinePoint.x) /
                             (endLinePoint.y - startLinePoint.y) + startLinePoint.x;

    return Math.round(equationSlope * y + equationXIntercept);

}
