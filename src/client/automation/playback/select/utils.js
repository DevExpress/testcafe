import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';

var browserUtils = hammerhead.utils.browser;

var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var styleUtils      = testCafeCore.styleUtils;
var contentEditable = testCafeCore.contentEditable;
var arrayUtils      = testCafeCore.arrayUtils;


const MODIFIERS_LIST = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom', 'border-top-width', 'border-left-width', 'border-right-width', 'border-bottom-width'];

function ensureRectangleInsideElement (element, rect) {
    var elementBorders = styleUtils.getBordersWidth(element);
    var elementOffset  = positionUtils.getOffsetPosition(element);

    // NOTE: strange behavior in Chrome - for some elements (e.g., for the 'font' element)
    // scrollHeight is 0, so we use getBoundingClientRect
    var elementHeight = element.scrollHeight || element.getBoundingClientRect().height;
    var left          = Math.ceil(rect.left);
    var top           = Math.ceil(rect.top);
    var bottom        = Math.floor(rect.bottom);

    if (!domUtils.isTextAreaElement(element)) {
        var clientOffset = positionUtils.offsetToClientCoords({
            x: elementOffset.left,
            y: elementOffset.top
        });

        var minLeft     = clientOffset.x + elementBorders.left + 1;
        var minTop      = clientOffset.y + elementBorders.top + 1;
        var bottomBound = clientOffset.y + elementBorders.top + elementBorders.bottom + elementHeight;
        var maxBottom   = clientOffset.y + elementBorders.top + elementHeight - 1;

        left   = Math.ceil(left <= clientOffset.x ? minLeft : rect.left);
        top    = Math.ceil(top <= clientOffset.y ? minTop : rect.top);
        bottom = Math.floor(bottom >= bottomBound ? maxBottom : rect.bottom);
    }

    return {
        left:   left,
        top:    top,
        bottom: bottom
    };
}

function getAbsoluteRect (rect) {
    var documentScroll = styleUtils.getElementScroll(document);

    return {
        left:   rect.left + documentScroll.left,
        top:    rect.top + documentScroll.top,
        bottom: rect.bottom + documentScroll.top
    };
}

function getSelectionRectangleInContentEditableElement (element, position) {
    var range             = domUtils.findDocument(element).createRange();
    var selectionPosition = contentEditable.calculateNodeAndOffsetByPosition(element, position);

    range.setStart(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));
    range.setEnd(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));

    return range.getClientRects()[0];
}

function getTextSelectionRectangle (element, position) {
    var range = element.createTextRange();

    range.collapse(true);
    range.moveStart('character', position);
    range.moveEnd('character', position);
    range.collapse(true);

    return range.getBoundingClientRect();
}

function getSelectionRectangle (element, position) {
    var clientRectBeforeFakeDiv = element.getBoundingClientRect();
    var fakeDiv                 = createFakeDiv(element);
    var rect                    = null;
    var clientRectAfterFakeDiv  = element.getBoundingClientRect();
    var topBoundDiff            = clientRectAfterFakeDiv.top - clientRectBeforeFakeDiv.top;
    var leftBoundDiff           = clientRectAfterFakeDiv.left - clientRectBeforeFakeDiv.left;
    var valueLength             = domUtils.getElementValue(element).length;

    try {
        var range = document.createRange(); //B254723

        range.setStart(hammerhead.nativeMethods.nodeFirstChildGetter.call(fakeDiv), Math.min(position, valueLength));
        // NOTE: The range.getClientRects function returns wrong result if range length is 0 in Safari 11
        range.setEnd(hammerhead.nativeMethods.nodeFirstChildGetter.call(fakeDiv), Math.min(position + 1, valueLength + 1));

        if (domUtils.isTextAreaElement(element)) {
            rect = range.getBoundingClientRect();

            if (rect.width === 0 && rect.height === 0)
                rect = range.getClientRects()[0];
        }
        else
            rect = range.getClientRects()[0];
    }
    catch (err) {
        rect = null;
    }

    domUtils.remove(fakeDiv);

    if (!rect)
        return null;

    return {
        width:  rect.width,
        height: rect.height,
        top:    rect.top - topBoundDiff,
        bottom: rect.bottom - topBoundDiff,
        left:   rect.left - leftBoundDiff,
        right:  rect.right - leftBoundDiff
    };
}

function createFakeDiv (element) {
    var body          = document.body;
    var elementOffset = positionUtils.getOffsetPosition(element);
    var elementMargin = styleUtils.getElementMargin(element);
    var elementTop    = elementOffset.top - elementMargin.top;
    var elementLeft   = elementOffset.left - elementMargin.left;

    var fakeDiv          = document.createElement('div');
    var fakeDivCssStyles = 'white-space:pre-wrap;border-style:solid;';

    if (styleUtils.get(body, 'position') === 'absolute') {
        var bodyMargin = styleUtils.getElementMargin(body);
        var bodyLeft   = styleUtils.get(body, 'left');
        var bodyTop    = styleUtils.get(body, 'top');

        elementLeft -= bodyMargin.left + (parseInt(bodyLeft.replace('px', ''), 10) || 0);
        elementTop -= bodyMargin.top + (parseInt(bodyTop.replace('px', ''), 10) || 0);
    }

    arrayUtils.forEach(MODIFIERS_LIST, modifier => {
        fakeDivCssStyles += `${modifier}:${styleUtils.get(element, modifier)};`;
    });

    styleUtils.set(fakeDiv, {
        cssText:  fakeDivCssStyles,
        position: 'absolute',
        left:     elementLeft + 'px',
        top:      elementTop + 'px',
        width:    element.scrollWidth + 'px',
        height:   element.scrollHeight + 'px'
    });

    fakeDiv.textContent = domUtils.getElementValue(element) + ' ';

    body.appendChild(fakeDiv);

    return fakeDiv;
}

function getPositionCoordinates (element, position) {
    var rect = null;

    if (domUtils.isContentEditableElement(element))
        rect = getSelectionRectangleInContentEditableElement(element, position);
    else if (typeof element.createTextRange === 'function')
        rect = getTextSelectionRectangle(element, position);
    else
        rect = getSelectionRectangle(element, position);

    if (!rect)
        return null;

    rect = ensureRectangleInsideElement(element, rect);
    rect = getAbsoluteRect(rect);

    return {
        x: rect.left,
        y: Math.floor(rect.top + (rect.bottom - rect.top) / 2)
    };
}

export function getSelectionCoordinatesByPosition (element, position) {
    var isTextEditable    = domUtils.isTextEditableElement(element);
    var isContentEditable = domUtils.isContentEditableElement(element);
    var hasText           = isTextEditable && domUtils.getElementValue(element).length > 0 ||
                            isContentEditable && contentEditable.getContentEditableValue(element).length;

    if (!hasText)
        return positionUtils.findCenter(element);

    return getPositionCoordinates(element, position);
}

export function getSelectionCoordinatesByNodeAndOffset (element, node, offset) {
    var range = domUtils.findDocument(element).createRange();

    range.setStart(node, Math.min(offset, node.length));
    range.setEnd(node, Math.min(offset, node.length));

    var rect = range.getClientRects()[0];

    if (!rect)
        return null;

    rect = ensureRectangleInsideElement(element, rect);
    rect = getAbsoluteRect(rect);

    return {
        x: rect.left,
        y: Math.floor(rect.top + (rect.bottom - rect.top) / 2)
    };
}

export function getLastVisibleSelectionPosition (element, startPos, endPos) {
    var backward     = startPos > endPos;
    var inc          = backward ? 1 : -1;
    var currentPos   = endPos;
    var currentPoint = null;

    while (currentPos !== startPos) {
        currentPos += inc;
        currentPoint = getPositionCoordinates(element, currentPos);

        if (currentPoint)
            break;
    }

    if (!currentPoint) {
        currentPoint = getPositionCoordinates(element, startPos) ||
                       positionUtils.findCenter(element);
    }

    return currentPoint;
}

export function scrollEditableElementByPoint (element, point) {
    if (!domUtils.isEditableElement(element))
        return;

    var isTextarea     = domUtils.isTextAreaElement(element);
    var isInputElement = domUtils.isInputElement(element);

    // NOTE: we don't need to scroll input elements in Mozilla and
    // IE > 10 because it happens automatically on selection setting
    if (isInputElement && (browserUtils.isFirefox || browserUtils.isIE && browserUtils.version > 10))
        return;

    var elementOffset  = positionUtils.getOffsetPosition(element);
    var elementBorders = styleUtils.getBordersWidth(element);
    var elementScroll  = styleUtils.getElementScroll(element);

    var offsetX     = point.x - elementOffset.left - elementBorders.left;
    var offsetY     = point.y - elementOffset.top - elementBorders.top;
    var scrollValue = null;

    if (isTextarea) {
        if (offsetY < elementScroll.top)
            scrollValue = offsetY;

        if (offsetY > element.clientHeight + elementScroll.top)
            scrollValue = offsetY - element.clientHeight;

        if (scrollValue !== null)
            styleUtils.setScrollTop(element, Math.round(scrollValue));

        return;
    }

    if (offsetX < elementScroll.left)
        scrollValue = offsetX;

    if (offsetX > element.clientWidth + elementScroll.left)
        scrollValue = offsetX - element.clientWidth;

    if (scrollValue !== null)
        styleUtils.setScrollLeft(element, Math.round(scrollValue));
}

export function excludeElementScroll (element, point) {
    var isTextEditable = domUtils.isTextEditableElement(element);
    var isInputElement = domUtils.isInputElement(element);

    if (!(isTextEditable || domUtils.isContentEditableElement(element)))
        return point;

    var elementOffset  = positionUtils.getOffsetPosition(element);
    var elementBorders = styleUtils.getBordersWidth(element);
    var elementScroll  = styleUtils.getElementScroll(element);
    var maxLeft        = elementOffset.left + elementBorders.left + element.clientWidth;

    // NOTE: we can't know input elements' scroll value in Mozilla and
    // IE > 10 (https://bugzilla.mozilla.org/show_bug.cgi?id=293186)
    if (isInputElement && isTextEditable &&
        (browserUtils.isFirefox || browserUtils.isIE && browserUtils.version > 10)) {
        return {
            x: Math.min(point.x, maxLeft),
            y: point.y
        };
    }

    return {
        x: point.x - elementScroll.left,
        y: point.y - elementScroll.top
    };
}
