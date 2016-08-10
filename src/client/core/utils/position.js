/* global isIFrameWithoutSrc:true */
import hammerhead from '../deps/hammerhead';
import * as styleUtils from './style';
import * as domUtils from './dom';


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
    else if (styleUtils.isSelectVisibleChild(el)) {
        var select              = domUtils.getSelectParent(el);
        var childRealIndex      = domUtils.getChildVisibleIndex(select, el);
        var realSelectSizeValue = styleUtils.getSelectElementSize(select);
        var topVisibleIndex     = Math.max(styleUtils.getScrollTop(select) / styleUtils.getOptionHeight(select), 0);
        var bottomVisibleIndex  = topVisibleIndex + realSelectSizeValue - 1;
        var optionVisibleIndex  = Math.max(childRealIndex - topVisibleIndex, 0);

        return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
    }
    else if (domUtils.isSVGElement(el))
        return styleUtils.get(el, 'visibility') !== 'hidden' && styleUtils.get(el, 'display') !== 'none';
    else
        return styleUtils.hasDimensions(el) && styleUtils.get(el, 'visibility') !== 'hidden';
}

export function getClientDimensions (target) {
    if (!domUtils.isDomElement(target)) {
        var clientPoint = offsetToClientCoords(target);

        return {
            border: {
                bottom: 0,
                left:   0,
                right:  0,
                top:    0
            },
            bottom: clientPoint.y,
            height: 0,
            left:   clientPoint.x,
            right:  clientPoint.x,
            scroll: {
                left: 0,
                top:  0
            },
            top:    clientPoint.y,
            width:  0
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

    if (isHtmlElement && (typeof isIFrameWithoutSrc === 'boolean' && isIFrameWithoutSrc) && body) {
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
                elementBorders.bottom = elementBorders.bottom + iframeBorders.bottom;
                elementBorders.left   = elementBorders.left + iframeBorders.left;
                elementBorders.right  = elementBorders.right + iframeBorders.right;
                elementBorders.top    = elementBorders.top + iframeBorders.top;
            }
        }
    }

    return {
        border:    elementBorders,
        bottom:    elementTopPosition + elementHeight,
        height:    elementHeight,
        left:      elementLeftPosition,
        right:     elementLeftPosition + elementWidth,
        scroll:    {
            left: elementScroll.left,
            top:  elementScroll.top
        },
        scrollbar: {
            right:  isHtmlElement ||
                    styleUtils.getInnerWidth(target) === target.clientWidth ? 0 : domUtils.getScrollbarSize(),
            bottom: isHtmlElement ||
                    styleUtils.getInnerHeight(target) === target.clientHeight ? 0 : domUtils.getScrollbarSize()
        },
        top:       elementTopPosition,
        width:     elementWidth
    };
}

export function containsOffset (el, offsetX, offsetY) {
    var dimensions = getClientDimensions(el);
    var width      = Math.max(el.scrollWidth, dimensions.width);
    var height     = Math.max(el.scrollHeight, dimensions.height);
    var maxX       = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + width;
    var maxY       = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + height;

    return (typeof offsetX === 'undefined' || (offsetX >= 0 && maxX >= offsetX)) &&
           (typeof offsetY === 'undefined' || ( offsetY >= 0 && maxY >= offsetY));
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
    var curCoordObject = /^touch/.test(ev.type) && ev.targetTouches ? (ev.targetTouches[0] ||
                                                                       ev.changedTouches[0]) : ev;

    if ((curCoordObject.pageX === null || (curCoordObject.pageX === 0 && curCoordObject.pageY === 0 &&
                                           (curCoordObject.clientX !== 0 || curCoordObject.clientY !== 0))) &&
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
    } catch (ex) {
        return null;
    }

    //NOTE: elementFromPoint returns null when is's a border of an iframe
    if (el === null)
        el = func.call(document, x - 1, y - 1);

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

    return offsetToClientCoords({ x: left, y: top });
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
        left:   dimensions.left - (toDimensions.left + toDimensions.border.left),
        right:  toDimensions.right - toDimensions.border.right - toDimensions.scrollbar.right - dimensions.right,
        top:    dimensions.top - (toDimensions.top + toDimensions.border.top),
        bottom: toDimensions.bottom - toDimensions.border.bottom - toDimensions.scrollbar.bottom - dimensions.bottom
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

export var getElementRectangle  = hammerhead.utils.position.getElementRectangle;
export var getOffsetPosition    = hammerhead.utils.position.getOffsetPosition;
export var offsetToClientCoords = hammerhead.utils.position.offsetToClientCoords;
