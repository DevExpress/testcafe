import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';

const browserUtils = hammerhead.utils.browser;

const domUtils        = testCafeCore.domUtils;
const positionUtils   = testCafeCore.positionUtils;
const styleUtils      = testCafeCore.styleUtils;
const contentEditable = testCafeCore.contentEditable;
const arrayUtils      = testCafeCore.arrayUtils;


const MODIFIERS_LIST = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom', 'border-top-width', 'border-left-width', 'border-right-width', 'border-bottom-width'];

function ensureRectangleInsideElement (element, rect) {
    const elementBorders = styleUtils.getBordersWidth(element);
    const elementOffset  = positionUtils.getOffsetPosition(element);

    // NOTE: strange behavior in Chrome - for some elements (e.g., for the 'font' element)
    // scrollHeight is 0, so we use getBoundingClientRect
    const elementHeight = element.scrollHeight || element.getBoundingClientRect().height;
    let left          = Math.ceil(rect.left);
    let top           = Math.ceil(rect.top);
    let bottom        = Math.floor(rect.bottom);

    if (!domUtils.isTextAreaElement(element)) {
        const clientOffset = positionUtils.offsetToClientCoords({
            x: elementOffset.left,
            y: elementOffset.top
        });

        const minLeft     = clientOffset.x + elementBorders.left + 1;
        const minTop      = clientOffset.y + elementBorders.top + 1;
        const bottomBound = clientOffset.y + elementBorders.top + elementBorders.bottom + elementHeight;
        const maxBottom   = clientOffset.y + elementBorders.top + elementHeight - 1;

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
    const documentScroll = styleUtils.getElementScroll(document);

    return {
        left:   rect.left + documentScroll.left,
        top:    rect.top + documentScroll.top,
        bottom: rect.bottom + documentScroll.top
    };
}

function getSelectionRectangleInContentEditableElement (element, position) {
    const range             = domUtils.findDocument(element).createRange();
    const selectionPosition = contentEditable.calculateNodeAndOffsetByPosition(element, position);

    range.setStart(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));
    range.setEnd(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));

    return range.getClientRects()[0];
}

function getTextSelectionRectangle (element, position) {
    const range = element.createTextRange();

    range.collapse(true);
    range.moveStart('character', position);
    range.moveEnd('character', position);
    range.collapse(true);

    return range.getBoundingClientRect();
}

function getSelectionRectangle (element, position) {
    const clientRectBeforeFakeDiv = element.getBoundingClientRect();
    const fakeDiv                 = createFakeDiv(element);
    let rect                    = null;
    const clientRectAfterFakeDiv  = element.getBoundingClientRect();
    const topBoundDiff            = clientRectAfterFakeDiv.top - clientRectBeforeFakeDiv.top;
    const leftBoundDiff           = clientRectAfterFakeDiv.left - clientRectBeforeFakeDiv.left;
    const valueLength             = domUtils.getElementValue(element).length;

    try {
        const range = document.createRange(); //B254723

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
    const body          = document.body;
    const elementOffset = positionUtils.getOffsetPosition(element);
    const elementMargin = styleUtils.getElementMargin(element);
    let elementTop    = elementOffset.top - elementMargin.top;
    let elementLeft   = elementOffset.left - elementMargin.left;

    const fakeDiv          = document.createElement('div');
    let fakeDivCssStyles = 'white-space:pre-wrap;border-style:solid;';

    if (styleUtils.get(body, 'position') === 'absolute') {
        const bodyMargin = styleUtils.getElementMargin(body);
        const bodyLeft   = styleUtils.get(body, 'left');
        const bodyTop    = styleUtils.get(body, 'top');

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

    hammerhead.nativeMethods.nodeTextContentSetter.call(fakeDiv, domUtils.getElementValue(element) + ' ');

    body.appendChild(fakeDiv);

    return fakeDiv;
}

function getPositionCoordinates (element, position) {
    let rect = null;

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
    const isTextEditable    = domUtils.isTextEditableElement(element);
    const isContentEditable = domUtils.isContentEditableElement(element);
    const hasText           = isTextEditable && domUtils.getElementValue(element).length > 0 ||
                            isContentEditable && contentEditable.getContentEditableValue(element).length;

    if (!hasText)
        return positionUtils.findCenter(element);

    return getPositionCoordinates(element, position);
}

export function getSelectionCoordinatesByNodeAndOffset (element, node, offset) {
    const range = domUtils.findDocument(element).createRange();

    range.setStart(node, Math.min(offset, node.length));
    range.setEnd(node, Math.min(offset, node.length));

    let rect = range.getClientRects()[0];

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
    const backward     = startPos > endPos;
    const inc          = backward ? 1 : -1;
    let currentPos   = endPos;
    let currentPoint = null;

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

    const isTextarea     = domUtils.isTextAreaElement(element);
    const isInputElement = domUtils.isInputElement(element);

    // NOTE: we don't need to scroll input elements in Mozilla and
    // IE > 10 because it happens automatically on selection setting
    if (isInputElement && (browserUtils.isFirefox || browserUtils.isIE && browserUtils.version > 10))
        return;

    const elementOffset  = positionUtils.getOffsetPosition(element);
    const elementBorders = styleUtils.getBordersWidth(element);
    const elementScroll  = styleUtils.getElementScroll(element);

    const offsetX     = point.x - elementOffset.left - elementBorders.left;
    const offsetY     = point.y - elementOffset.top - elementBorders.top;
    let scrollValue = null;

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
    const isTextEditable = domUtils.isTextEditableElement(element);
    const isInputElement = domUtils.isInputElement(element);

    if (!(isTextEditable || domUtils.isContentEditableElement(element)))
        return point;

    const elementOffset  = positionUtils.getOffsetPosition(element);
    const elementBorders = styleUtils.getBordersWidth(element);
    const elementScroll  = styleUtils.getElementScroll(element);
    const maxLeft        = elementOffset.left + elementBorders.left + element.clientWidth;

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
