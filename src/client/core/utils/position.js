import hammerhead from '../deps/hammerhead';
import * as styleUtils from './style';
import * as domUtils from './dom';
import * as shared from './shared/position';
import AxisValues from '../../../shared/utils/values/axis-values';

export { isElementVisible, isIframeVisible } from './shared/visibility';

export const getElementRectangle  = hammerhead.utils.position.getElementRectangle;
export const getOffsetPosition    = hammerhead.utils.position.getOffsetPosition;
export const offsetToClientCoords = hammerhead.utils.position.offsetToClientCoords;
export const getClientDimensions  = shared.getClientDimensions;
export const getElementFromPoint  = shared.getElementFromPoint;
export const calcRelativePosition = shared.calcRelativePosition;

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
        bottom: iframeRectangleTop + styleUtils.getHeight(iframe),
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
        y: pageCoordinates.y + yOffset,
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
                          (html.clientTop || 0)),
        };
    }
    return {
        x: Math.round(curCoordObject.pageX),
        y: Math.round(curCoordObject.pageY),
    };
}

export function getIframePointRelativeToParentFrame (pos, iframeWin) {
    const iframe        = domUtils.findIframeByWindow(iframeWin);
    const iframeOffset  = getOffsetPosition(iframe);
    const iframeBorders = styleUtils.getBordersWidth(iframe);
    const iframePadding = styleUtils.getElementPadding(iframe);

    return offsetToClientCoords({
        x: pos.x + iframeOffset.left + iframeBorders.left + iframePadding.left,
        y: pos.y + iframeOffset.top + iframeBorders.top + iframePadding.top,
    });
}

export function clientToOffsetCoord (coords, currentDocument) {
    const doc = currentDocument || document;

    return {
        x: coords.x + styleUtils.getScrollLeft(doc),
        y: coords.y + styleUtils.getScrollTop(doc),
    };
}

export function findCenter (el) {
    const rectangle = getElementRectangle(el);

    return {
        x: Math.round(rectangle.left + rectangle.width / 2),
        y: Math.round(rectangle.top + rectangle.height / 2),
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
        y: rect.top,
    });

    return {
        height: rect.height,
        left:   clientPos.x,
        top:    clientPos.y,
        width:  rect.width,
    };
}

export function isInRectangle ({ x, y }, rectangle) {
    return x >= rectangle.left && x <= rectangle.right && y >= rectangle.top && y <= rectangle.bottom;
}

export function getWindowPosition () {
    const x = window.screenLeft || window.screenX;
    const y = window.screenTop || window.screenY;

    return new AxisValues(x, y);
}
