import hammerhead from '../deps/hammerhead';
import * as domUtils from './dom';
import * as positionUtils from './position';
import * as styleUtils from './style';
import * as contentEditable from './content-editable';
import * as eventUtils from './event';
import { forEach } from './array';


var browserUtils     = hammerhead.utils.browser;
var selectionSandbox = hammerhead.eventSandbox.selection;


//NOTE: we can't determine selection direction in ie from dom api. Therefore we should listen selection changes,
// and calculate direction using it.
const BACKWARD_SELECTION_DIRECTION = 'backward';
const FORWARD_SELECTION_DIRECTION  = 'forward';
const NONE_SELECTION_DIRECTION     = 'none';


var selectionDirection  = NONE_SELECTION_DIRECTION,

    initialLeft         = 0,
    initialTop          = 0,
    lastSelectionHeight = 0,
    lastSelectionLeft   = 0,
    lastSelectionLength = 0,
    lastSelectionTop    = 0;

function stateChanged (left, top, height, width, selectionLength) {
    if (!selectionLength) {
        initialLeft        = left;
        initialTop         = top;
        selectionDirection = NONE_SELECTION_DIRECTION;
    }
    else {
        switch (selectionDirection) {
            case NONE_SELECTION_DIRECTION:
                if (top === lastSelectionTop && (left === lastSelectionLeft || height > lastSelectionHeight))
                    selectionDirection = FORWARD_SELECTION_DIRECTION;
                else if (left < lastSelectionLeft || top < lastSelectionTop)
                    selectionDirection = BACKWARD_SELECTION_DIRECTION;

                break;

            case FORWARD_SELECTION_DIRECTION:
                if (left === lastSelectionLeft && top === lastSelectionTop ||
                    (left < lastSelectionLeft && height > lastSelectionHeight) ||
                    (top === lastSelectionTop && height === lastSelectionHeight &&
                    selectionLength > lastSelectionLength) &&
                    (left + width) !== initialLeft) {

                    break;
                }
                else if (left < lastSelectionLeft || top < lastSelectionTop)
                    selectionDirection = BACKWARD_SELECTION_DIRECTION;

                break;

            case BACKWARD_SELECTION_DIRECTION:
                if ((left < lastSelectionLeft || top < lastSelectionTop) && selectionLength > lastSelectionLength)
                    break;
                else if (top === initialTop && (left >= initialLeft || height > lastSelectionHeight))
                    selectionDirection = FORWARD_SELECTION_DIRECTION;

                break;
        }
    }

    lastSelectionHeight = height;
    lastSelectionLeft   = left;
    lastSelectionLength = selectionLength;
    lastSelectionTop    = top;
}

function onSelectionChange () {
    var activeElement  = null,
        endSelection   = null,
        range          = null,
        rect           = null,
        startSelection = null;

    try {
        if (this.selection)
            range = this.selection.createRange();
        else {
            //HACK: we need do this for IE11 because otherwise we can not get TextRange properties
            activeElement = this.activeElement;

            if (!activeElement || !domUtils.isTextEditableElement(activeElement)) {
                selectionDirection = NONE_SELECTION_DIRECTION;

                return;
            }

            startSelection = getSelectionStart(activeElement);
            endSelection   = getSelectionEnd(activeElement);

            if (activeElement.createTextRange) {
                range = activeElement.createTextRange();
                range.collapse(true);
                range.moveStart('character', startSelection);
                range.moveEnd('character', endSelection - startSelection);
            }
            else if (document.createRange) {
                //NOTE: for MSEdge
                range        = document.createRange();
                var textNode = activeElement.firstChild;
                range.setStart(textNode, startSelection);
                range.setEnd(textNode, endSelection);
                rect         = range.getBoundingClientRect();
            }
        }
    } catch (e) {
        //NOTE: in ie it raises error when there are not a real selection
        selectionDirection = NONE_SELECTION_DIRECTION;

        return;
    }

    var rangeLeft           = rect ? Math.ceil(rect.left) : range.offsetLeft,
        rangeTop            = rect ? Math.ceil(rect.top) : range.offsetTop,
        rangeHeight         = rect ? Math.ceil(rect.height) : range.boundingHeight,
        rangeWidth          = rect ? Math.ceil(rect.width) : range.boundingWidth,
        rangeHTMLTextLength = range.htmlText ? range.htmlText.length : 0,
        rangeTextLength     = rect ? range.toString().length : rangeHTMLTextLength;

    stateChanged(rangeLeft, rangeTop, rangeHeight, rangeWidth, rangeTextLength);
}

if (browserUtils.isIE)
    eventUtils.bind(document, 'selectionchange', onSelectionChange, true);

//utils for contentEditable
function selectContentEditable (el, from, to, needFocus, inverse) {
    var endPosition         = null,
        firstTextNodeChild  = null,
        latestTextNodeChild = null,
        startPosition       = null,
        temp                = null;

    if (typeof from !== 'undefined' && typeof to !== 'undefined' && from > to) {
        temp    = from;
        from    = to;
        to      = temp;
        inverse = true;
    }

    if (typeof from === 'undefined') {
        firstTextNodeChild = contentEditable.getFirstVisibleTextNode(el);
        startPosition      = {
            node:   firstTextNodeChild || el,
            offset: firstTextNodeChild && firstTextNodeChild.nodeValue ?
                    contentEditable.getFirstNonWhitespaceSymbolIndex(firstTextNodeChild.nodeValue) : 0
        };
    }

    if (typeof to === 'undefined') {
        latestTextNodeChild = contentEditable.getLastTextNode(el, true);
        endPosition         = {
            node:   latestTextNodeChild || el,
            offset: latestTextNodeChild && latestTextNodeChild.nodeValue ?
                    contentEditable.getLastNonWhitespaceSymbolIndex(latestTextNodeChild.nodeValue) : 0
        };
    }

    startPosition = startPosition || contentEditable.calculateNodeAndOffsetByPosition(el, from);
    endPosition   = endPosition || contentEditable.calculateNodeAndOffsetByPosition(el, to);

    if (!startPosition.node || !endPosition.node)
        return;

    selectByNodesAndOffsets(startPosition.node, startPosition.offset, endPosition.node, endPosition.offset, needFocus, inverse);
}

function correctContentEditableSelectionBeforeDelete (el) {
    var selection                         = getSelectionByElement(el),

        startNode                         = selection.anchorNode,
        endNode                           = selection.focusNode,

        startOffset                       = selection.anchorOffset,
        endOffset                         = selection.focusOffset,

        startNodeFirstNonWhitespaceSymbol = contentEditable.getFirstNonWhitespaceSymbolIndex(startNode.nodeValue),
        startNodeLastNonWhitespaceSymbol  = contentEditable.getLastNonWhitespaceSymbolIndex(startNode.nodeValue),

        endNodeFirstNonWhitespaceSymbol   = contentEditable.getFirstNonWhitespaceSymbolIndex(endNode.nodeValue),
        endNodeLastNonWhitespaceSymbol    = contentEditable.getLastNonWhitespaceSymbolIndex(endNode.nodeValue),

        newStartOffset                    = null,
        newEndOffset                      = null;

    if (startNode.nodeType === 3) {
        if (startOffset < startNodeFirstNonWhitespaceSymbol && startOffset !== 0)
            newStartOffset = 0;
        else if (startOffset !== startNode.nodeValue.length &&
                 ((contentEditable.isInvisibleTextNode(startNode) && startOffset !== 0) ||
                  (startOffset > startNodeLastNonWhitespaceSymbol)))
            newStartOffset = startNode.nodeValue.length;
    }

    if (endNode.nodeType === 3) {
        if (endOffset < endNodeFirstNonWhitespaceSymbol && endOffset !== 0)
            newEndOffset = 0;
        else if (endOffset !== endNode.nodeValue.length &&
                 ((contentEditable.isInvisibleTextNode(endNode) && endOffset !== 0) ||
                  (endOffset > endNodeLastNonWhitespaceSymbol)))
            newEndOffset = endNode.nodeValue.length;
    }

    if (browserUtils.isWebKit || (browserUtils.isIE && browserUtils.version > 11)) {
        if (newStartOffset !== null) {
            if (newStartOffset === 0)
                startNode.nodeValue = startNode.nodeValue.substring(startNodeFirstNonWhitespaceSymbol);
            else
                startNode.nodeValue = startNode.nodeValue.substring(0, startNodeLastNonWhitespaceSymbol);
        }

        if (newEndOffset !== null) {
            if (newEndOffset === 0)
                endNode.nodeValue = endNode.nodeValue.substring(endNodeFirstNonWhitespaceSymbol);
            else
                endNode.nodeValue = endNode.nodeValue.substring(0, endNodeLastNonWhitespaceSymbol);
        }
    }

    if (newStartOffset !== null || newEndOffset !== null) {
        newStartOffset = newStartOffset !== null ? (newStartOffset ===
                                                    0 ? newStartOffset : startNode.nodeValue.length) : startOffset;
        newEndOffset   = newEndOffset !== null ? (newEndOffset ===
                                                  0 ? newEndOffset : endNode.nodeValue.length) : endOffset;
        selectByNodesAndOffsets(startNode, newStartOffset, endNode, newEndOffset);
    }
}

function correctRectangle (currentRect, options) {
    var documentScroll       = options.documentScroll,
        iFrameDocumentScroll = options.iFrameDocumentScroll,
        iFrameOffset         = options.iFrameOffset,
        iFramePadding        = options.iFramePadding,
        iFrameBorders        = options.iFrameBorders,

        currentRectHeight    = currentRect.top + options.elementHeight - 1,

        clientOffset         = null,

        currentLeft          = null,
        currentTop           = null,
        currentBottom        = null;

    if (browserUtils.isIE && browserUtils.version < 11 && options.isInProcessedIFrame) {
        if (browserUtils.version === 9 && !options.isContentEditable) {
            currentLeft   = Math.ceil(currentRect.left) + options.windowTopScroll.left -
                            options.crossDomainIFrameOffset.left - options.crossDomainIFrameBorders.left -
                            options.crossDomainIFramePadding.left;
            currentTop    = Math.ceil(currentRect.top) + options.windowTopScroll.top -
                            options.crossDomainIFrameOffset.top - options.crossDomainIFrameBorders.top -
                            options.crossDomainIFramePadding.top;
            currentBottom = Math.ceil(currentRect.bottom) + options.windowTopScroll.top -
                            options.crossDomainIFrameOffset.top - options.crossDomainIFrameBorders.top -
                            options.crossDomainIFramePadding.top;
        }
        else if (browserUtils.version === 10 || options.isContentEditable) {
            currentLeft   = Math.ceil(currentRect.left);
            currentTop    = Math.ceil(currentRect.top);
            currentBottom = Math.ceil(currentRect.bottom);
        }
    }
    else {
        if (options.isTextarea) {
            currentLeft   = Math.ceil(currentRect.left);
            currentTop    = Math.ceil(currentRect.top);
            currentBottom = Math.ceil(currentRect.bottom);
        }
        else {
            if (options.isInIFrame && (options.isContentEditable || browserUtils.isIE)) {
                clientOffset = options.elementOffset;
                clientOffset.left -= (iFrameOffset.left + iFrameBorders.left + iFramePadding.left);
                clientOffset.top -= (iFrameOffset.top + iFrameBorders.top + iFramePadding.top);
                clientOffset = positionUtils.offsetToClientCoords({ x: clientOffset.left, y: clientOffset.top });
            }
            else
                clientOffset = positionUtils.offsetToClientCoords({
                    x: options.elementOffset.left,
                    y: options.elementOffset.top
                });

            currentLeft   = Math.ceil(Math.ceil(currentRect.left) <= clientOffset.x ? clientOffset.x +
                                                                                      options.elementBorders.left +
                                                                                      1 : currentRect.left);
            currentTop    = Math.ceil(Math.ceil(currentRect.top) <= clientOffset.y ? clientOffset.y +
                                                                                     options.elementBorders.top +
                                                                                     1 : currentRect.top);
            currentBottom = Math.floor(Math.floor(currentRect.bottom) >=
                                       (clientOffset.y + options.elementBorders.top + options.elementBorders.bottom +
                                        options.elementHeight) ? currentRectHeight : currentRect.bottom);
        }
    }

    if (options.isInIFrame && (options.isContentEditable || (browserUtils.isIE && browserUtils.version !== 9))) {
        currentLeft   = currentLeft + iFrameDocumentScroll.left + iFrameOffset.left + iFrameBorders.left +
                        iFramePadding.left;
        currentTop    = currentTop + iFrameDocumentScroll.top + iFrameOffset.top + iFrameBorders.top +
                        iFramePadding.top;
        currentBottom = currentBottom + iFrameDocumentScroll.top + iFrameOffset.top + iFrameBorders.top +
                        iFramePadding.top;
    }
    else if (options.isInIFrame && browserUtils.isIE9) {
        currentLeft   = currentLeft + iFrameDocumentScroll.left + documentScroll.left;
        currentTop    = currentTop + iFrameDocumentScroll.top + documentScroll.top;
        currentBottom = currentBottom + iFrameDocumentScroll.top + documentScroll.top;
    }
    else if (options.isContentEditable || (browserUtils.isIE && browserUtils.version < 11)) {
        currentLeft   = currentLeft + documentScroll.left;
        currentTop    = currentTop + documentScroll.top;
        currentBottom = currentBottom + documentScroll.top;
    }
    else {
        currentLeft   = currentLeft + documentScroll.left + iFrameDocumentScroll.left;
        currentTop    = currentTop + documentScroll.top + iFrameDocumentScroll.top;
        currentBottom = currentBottom + documentScroll.top + iFrameDocumentScroll.top;
    }

    return {
        bottom: currentBottom,
        left:   currentLeft,
        top:    currentTop
    };
}

//API
export function hasInverseSelectionContentEditable (el) {
    var curDocument = el ? domUtils.findDocument(el) : document,
        selection   = curDocument.getSelection(),
        range       = null,
        backward    = false;

    if (selection) {
        if (!selection.isCollapsed) {
            range    = curDocument.createRange();
            range.setStart(selection.anchorNode, selection.anchorOffset);
            range.setEnd(selection.focusNode, selection.focusOffset);
            backward = range.collapsed;
            range.detach();
        }
    }

    return backward;
}

export function getSelectionStart (el) {
    var selection = null;

    if (!domUtils.isContentEditableElement(el))
        return selectionSandbox.getSelection(el).start;

    if (hasElementContainsSelection(el)) {
        selection = getSelectionByElement(el);

        return contentEditable.getSelectionStartPosition(el, selection, hasInverseSelectionContentEditable(el));
    }

    return 0;
}

export function getSelectionEnd (el) {
    var selection = null;

    if (!domUtils.isContentEditableElement(el))
        return selectionSandbox.getSelection(el).end;

    if (hasElementContainsSelection(el)) {
        selection = getSelectionByElement(el);

        return contentEditable.getSelectionEndPosition(el, selection, hasInverseSelectionContentEditable(el));
    }

    return 0;
}

export function getSelectedText (el) {
    return el.value.substring(getSelectionStart(el), getSelectionEnd(el));
}

export function hasInverseSelection (el) {
    if (domUtils.isContentEditableElement(el))
        return hasInverseSelectionContentEditable(el);

    return (selectionSandbox.getSelection(el).direction || selectionDirection) === BACKWARD_SELECTION_DIRECTION;
}

export function getSelectionByElement (el) {
    var currentDocument = domUtils.findDocument(el);

    return currentDocument ? currentDocument.getSelection() : window.getSelection();
}

export function getPositionCoordinates (el, position, correctOptions) {
    var range             = null,
        rects             = null,
        selectionPosition = null,
        rect              = null,

        isTextarea        = el.tagName.toLowerCase() === 'textarea',
        isContentEditable = domUtils.isContentEditableElement(el),
        offset            = positionUtils.getOffsetPosition(el);

    //NOTE: we don't create fake div element for contentEditable elements
    //because we can get the selection dimensions directly
    if (isContentEditable) {
        range             = domUtils.findDocument(el).createRange();
        selectionPosition = contentEditable.calculateNodeAndOffsetByPosition(el, position);

        range.setStart(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));
        range.setEnd(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));
        rect              = range.getClientRects()[0];

        return rect ? correctRectangle(rect, correctOptions) : null;
    }

    //NOTE: for IE
    if (typeof el.createTextRange === "function") {
        range = el.createTextRange();
        range.collapse(true);
        range.moveStart('character', position);
        range.moveEnd('character', position);
        range.collapse(true);
        rect  = range.getBoundingClientRect();

        return rect ? correctRectangle(rect, correctOptions) : null;
    }

    var body          = document.body;
    var bodyMargin    = styleUtils.getElementMargin(body);
    var bodyLeft      = null;
    var bodyTop       = null;
    var elementMargin = styleUtils.getElementMargin(el);
    var elementTop    = offset.top - elementMargin.top;
    var elementLeft   = offset.left - elementMargin.left;
    var width         = el.scrollWidth;

    var fakeDiv          = document.createElement('div');
    var fakeDivCssStyles = 'white-space:pre-wrap;border-style:solid;';
    var listOfModifiers  = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom', 'border-top-width', 'border-left-width', 'border-right-width', 'border-bottom-width'];

    if (styleUtils.get(body, 'position') === 'absolute') {
        elementLeft -= bodyMargin.left;
        elementTop -= bodyMargin.top;
        bodyLeft = styleUtils.get(body, 'left');

        if (bodyLeft !== 'auto')
            elementLeft -= parseInt(bodyLeft.replace('px', ''));

        bodyTop = styleUtils.get(body, 'top');

        if (bodyTop !== 'auto')
            elementTop -= parseInt(bodyTop.replace('px', ''));
    }

    forEach(listOfModifiers, modifier => fakeDivCssStyles += `${modifier}:${styleUtils.get(el, modifier)};`);

    body.appendChild(fakeDiv);

    try {
        styleUtils.set(fakeDiv, {
            cssText:  fakeDivCssStyles,
            position: 'absolute',
            left:     elementLeft + 'px',
            top:      elementTop + 'px',
            width:    width + 'px',
            height:   el.scrollHeight + 'px'
        });

        fakeDiv.textContent = !el.value.length ? ' ' : el.value;

        range = document.createRange(); //B254723
        range.setStart(fakeDiv.firstChild, Math.min(position, el.value.length));
        range.setEnd(fakeDiv.firstChild, Math.min(position, el.value.length));

        if (isTextarea) {
            rects = range.getClientRects();
            rect  = range.getBoundingClientRect();

            if (rect.width === 0 && rect.height === 0)
                rect = rects[0];
        }
        else
            rect = range.getClientRects()[0];

        domUtils.remove(fakeDiv);
    } catch (err) {
        domUtils.remove(fakeDiv);

        return {};
    }

    return rect ? correctRectangle(rect, correctOptions) : null;
}

export function select (el, from, to, inverse) {
    if (domUtils.isContentEditableElement(el)) {
        selectContentEditable(el, from, to, true, inverse);

        return;
    }

    var start = from || 0,
        end   = typeof to === 'undefined' ? el.value.length : to,
        temp  = null;

    if (start > end) {
        temp    = start;
        start   = end;
        end     = temp;
        inverse = true;
    }

    selectionSandbox.setSelection(el, start, end, inverse ? BACKWARD_SELECTION_DIRECTION : FORWARD_SELECTION_DIRECTION);

    selectionDirection = from === to ?
                         NONE_SELECTION_DIRECTION :
                         inverse ? BACKWARD_SELECTION_DIRECTION : FORWARD_SELECTION_DIRECTION;
}

export function selectByNodesAndOffsets (startNode, startOffset, endNode, endOffset, needFocus, inverse) {
    var parentElement   = contentEditable.findContentEditableParent(startNode),
        curDocument     = domUtils.findDocument(parentElement),
        selection       = getSelectionByElement(parentElement),
        range           = curDocument.createRange(),

        startNodeLength = startNode.nodeValue ? startNode.length : 0,
        endNodeLength   = endNode.nodeValue ? endNode.length : 0;

    var selectionSetter = function () {
        selection.removeAllRanges();

        //NOTE: For IE we can't create inverse selection
        if (!inverse || browserUtils.isIE) {
            range.setStart(startNode, Math.min(startNodeLength, startOffset));
            range.setEnd(endNode, Math.min(endNodeLength, endOffset));
            selection.addRange(range);
        }
        else {
            range.setStart(endNode, Math.min(endNodeLength, endOffset));
            range.setEnd(endNode, Math.min(endNodeLength, endOffset));
            selection.addRange(range);

            if (browserUtils.isWebKit && contentEditable.isInvisibleTextNode(startNode)) {
                try {
                    selection.extend(startNode, Math.min(startOffset, 1));
                } catch (err) {
                    selection.extend(startNode, 0);
                }
            }
            else
                selection.extend(startNode, Math.min(startNodeLength, startOffset));
        }
    };

    selectionSandbox.wrapSetterSelection(parentElement, selectionSetter, needFocus, true);
}

export function deleteSelectionContents (el, selectAll) {
    var startSelection = getSelectionStart(el),
        endSelection   = getSelectionEnd(el);

    function deleteSelectionRanges (el) {
        var selection  = getSelectionByElement(el),
            rangeCount = selection.rangeCount;

        if (!rangeCount)
            return;

        for (var i = 0; i < rangeCount; i++)
            selection.getRangeAt(i).deleteContents();
    }

    if (selectAll)
        selectContentEditable(el);

    if (startSelection === endSelection)
        return;

    // NOTE: If selection is not contain initial and final invisible symbols
    //we should select its
    correctContentEditableSelectionBeforeDelete(el);

    deleteSelectionRanges(el);

    var selection = getSelectionByElement(el),
        range     = null;

    //NOTE: We should try to do selection collapsed
    if (selection.rangeCount && !selection.getRangeAt(0).collapsed) {
        range = selection.getRangeAt(0);
        range.collapse(true);
    }
}

export function setCursorToLastVisiblePosition (el) {
    var position = contentEditable.getLastVisiblePosition(el);

    selectContentEditable(el, position, position);
}

export function hasElementContainsSelection (el) {
    var selection = getSelectionByElement(el);

    return selection.anchorNode && selection.focusNode ?
           domUtils.isElementContainsNode(el, selection.anchorNode) &&
           domUtils.isElementContainsNode(el, selection.focusNode) :
           false;
}
