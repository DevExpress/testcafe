import hammerhead from '../deps/hammerhead';
import * as domUtils from './dom';
import * as contentEditable from './content-editable';
import * as eventUtils from './event';


const browserUtils     = hammerhead.utils.browser;
const nativeMethods    = hammerhead.nativeMethods;
const selectionSandbox = hammerhead.eventSandbox.selection;


//NOTE: we can't determine selection direction in ie from dom api. Therefore we should listen selection changes,
// and calculate direction using it.
const BACKWARD_SELECTION_DIRECTION = 'backward';
const FORWARD_SELECTION_DIRECTION  = 'forward';
const NONE_SELECTION_DIRECTION     = 'none';


let selectionDirection  = NONE_SELECTION_DIRECTION;
let initialLeft         = 0;
let initialTop          = 0;
let lastSelectionHeight = 0;
let lastSelectionLeft   = 0;
let lastSelectionLength = 0;
let lastSelectionTop    = 0;

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
                    left < lastSelectionLeft && height > lastSelectionHeight ||
                    top === lastSelectionTop && height === lastSelectionHeight &&
                    selectionLength > lastSelectionLength &&
                    left + width !== initialLeft)
                    break;
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
    let activeElement  = null;
    let endSelection   = null;
    let range          = null;
    let rect           = null;
    let startSelection = null;

    try {
        if (this.selection)
            range = this.selection.createRange();
        else {
            //HACK: we need do this for IE11 because otherwise we can not get TextRange properties
            activeElement = nativeMethods.documentActiveElementGetter.call(this);

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
                range = document.createRange();

                const textNode = hammerhead.nativeMethods.nodeFirstChildGetter.call(activeElement);

                range.setStart(textNode, startSelection);
                range.setEnd(textNode, endSelection);
                rect = range.getBoundingClientRect();
            }
        }
    }
    catch (e) {
        //NOTE: in ie it raises error when there are not a real selection
        selectionDirection = NONE_SELECTION_DIRECTION;

        return;
    }

    const rangeLeft           = rect ? Math.ceil(rect.left) : range.offsetLeft;
    const rangeTop            = rect ? Math.ceil(rect.top) : range.offsetTop;
    const rangeHeight         = rect ? Math.ceil(rect.height) : range.boundingHeight;
    const rangeWidth          = rect ? Math.ceil(rect.width) : range.boundingWidth;
    const rangeHTMLTextLength = range.htmlText ? range.htmlText.length : 0;
    const rangeTextLength     = rect ? range.toString().length : rangeHTMLTextLength;

    stateChanged(rangeLeft, rangeTop, rangeHeight, rangeWidth, rangeTextLength);
}

if (browserUtils.isIE)
    eventUtils.bind(document, 'selectionchange', onSelectionChange, true);

//utils for contentEditable
function selectContentEditable (el, from, to, needFocus) {
    let endPosition         = null;
    let firstTextNodeChild  = null;
    let latestTextNodeChild = null;
    let startPosition       = null;
    let temp                = null;
    let inverse             = false;

    if (typeof from !== 'undefined' && typeof to !== 'undefined' && from > to) {
        temp    = from;
        from    = to;
        to      = temp;
        inverse = true;
    }

    if (typeof from === 'undefined') {
        firstTextNodeChild = contentEditable.getFirstVisibleTextNode(el);

        startPosition = {
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

    if (inverse)
        selectByNodesAndOffsets(endPosition, startPosition, needFocus);
    else
        selectByNodesAndOffsets(startPosition, endPosition, needFocus);
}

function correctContentEditableSelectionBeforeDelete (el) {
    const selection = getSelectionByElement(el);

    const startNode = selection.anchorNode;
    const endNode   = selection.focusNode;

    const startOffset = selection.anchorOffset;
    const endOffset   = selection.focusOffset;

    const startNodeFirstNonWhitespaceSymbol = contentEditable.getFirstNonWhitespaceSymbolIndex(startNode.nodeValue);
    const startNodeLastNonWhitespaceSymbol  = contentEditable.getLastNonWhitespaceSymbolIndex(startNode.nodeValue);

    const endNodeFirstNonWhitespaceSymbol = contentEditable.getFirstNonWhitespaceSymbolIndex(endNode.nodeValue);
    const endNodeLastNonWhitespaceSymbol  = contentEditable.getLastNonWhitespaceSymbolIndex(endNode.nodeValue);

    let newStartOffset = null;
    let newEndOffset   = null;

    if (domUtils.isTextNode(startNode)) {
        if (startOffset < startNodeFirstNonWhitespaceSymbol && startOffset !== 0)
            newStartOffset = 0;
        else if (startOffset !== startNode.nodeValue.length &&
                 (contentEditable.isInvisibleTextNode(startNode) && startOffset !== 0 ||
                  startOffset > startNodeLastNonWhitespaceSymbol))
            newStartOffset = startNode.nodeValue.length;
    }

    if (domUtils.isTextNode(endNode)) {
        if (endOffset < endNodeFirstNonWhitespaceSymbol && endOffset !== 0)
            newEndOffset = 0;
        else if (endOffset !== endNode.nodeValue.length &&
                 (contentEditable.isInvisibleTextNode(endNode) && endOffset !== 0 ||
                  endOffset > endNodeLastNonWhitespaceSymbol))
            newEndOffset = endNode.nodeValue.length;
    }

    if (browserUtils.isWebKit || browserUtils.isIE && browserUtils.version > 11) {
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
        if (newStartOffset !== null)
            newStartOffset = newStartOffset === 0 ? newStartOffset : startNode.nodeValue.length;
        else
            newStartOffset = startOffset;

        if (newEndOffset !== null)
            newEndOffset = newEndOffset === 0 ? newEndOffset : endNode.nodeValue.length;
        else
            newEndOffset = endOffset;

        const startPos = { node: startNode, offset: newStartOffset };
        const endPos   = { node: endNode, offset: newEndOffset };

        selectByNodesAndOffsets(startPos, endPos);
    }
}

//API
export function hasInverseSelectionContentEditable (el) {
    const curDocument = el ? domUtils.findDocument(el) : document;
    const selection   = curDocument.getSelection();
    let range       = null;
    let backward    = false;

    if (selection) {
        if (!selection.isCollapsed) {
            range = curDocument.createRange();
            range.setStart(selection.anchorNode, selection.anchorOffset);
            range.setEnd(selection.focusNode, selection.focusOffset);
            backward = range.collapsed;
            range.detach();
        }
    }

    return backward;
}

export function isInverseSelectionContentEditable (element, startPos, endPos) {
    const startPosition = contentEditable.calculatePositionByNodeAndOffset(element, startPos);
    const endPosition   = contentEditable.calculatePositionByNodeAndOffset(element, endPos);

    return startPosition > endPosition;
}

export function getSelectionStart (el) {
    let selection = null;

    if (!domUtils.isContentEditableElement(el))
        return selectionSandbox.getSelection(el).start;

    if (hasElementContainsSelection(el)) {
        selection = getSelectionByElement(el);

        return contentEditable.getSelectionStartPosition(el, selection, hasInverseSelectionContentEditable(el));
    }

    return 0;
}

export function getSelectionEnd (el) {
    let selection = null;

    if (!domUtils.isContentEditableElement(el))
        return selectionSandbox.getSelection(el).end;

    if (hasElementContainsSelection(el)) {
        selection = getSelectionByElement(el);

        return contentEditable.getSelectionEndPosition(el, selection, hasInverseSelectionContentEditable(el));
    }

    return 0;
}

export function hasInverseSelection (el) {
    if (domUtils.isContentEditableElement(el))
        return hasInverseSelectionContentEditable(el);

    return (selectionSandbox.getSelection(el).direction || selectionDirection) === BACKWARD_SELECTION_DIRECTION;
}

export function getSelectionByElement (el) {
    const currentDocument = domUtils.findDocument(el);

    return currentDocument ? currentDocument.getSelection() : window.getSelection();
}

export function select (el, from, to) {
    if (domUtils.isContentEditableElement(el)) {
        selectContentEditable(el, from, to, true);

        return;
    }

    let start   = from || 0;
    let end     = typeof to === 'undefined' ? domUtils.getElementValue(el).length : to;
    let inverse = false;
    let temp    = null;

    if (start > end) {
        temp    = start;
        start   = end;
        end     = temp;
        inverse = true;
    }

    selectionSandbox.setSelection(el, start, end, inverse ? BACKWARD_SELECTION_DIRECTION : FORWARD_SELECTION_DIRECTION);

    if (from === to)
        selectionDirection = NONE_SELECTION_DIRECTION;
    else
        selectionDirection = inverse ? BACKWARD_SELECTION_DIRECTION : FORWARD_SELECTION_DIRECTION;
}

export function selectByNodesAndOffsets (startPos, endPos, needFocus) {
    const startNode = startPos.node;
    const endNode   = endPos.node;

    const startNodeLength = startNode.nodeValue ? startNode.length : 0;
    const endNodeLength   = endNode.nodeValue ? endNode.length : 0;
    let startOffset     = startPos.offset;
    let endOffset       = endPos.offset;

    if (!domUtils.isElementNode(startNode) || !startOffset)
        startOffset = Math.min(startNodeLength, startPos.offset);

    if (!domUtils.isElementNode(endNode) || !endOffset)
        endOffset = Math.min(endNodeLength, endPos.offset);

    const parentElement = contentEditable.findContentEditableParent(startNode);
    const inverse       = isInverseSelectionContentEditable(parentElement, startPos, endPos);


    const selection   = getSelectionByElement(parentElement);
    const curDocument = domUtils.findDocument(parentElement);
    const range       = curDocument.createRange();

    const selectionSetter = function () {
        selection.removeAllRanges();

        //NOTE: For IE we can't create inverse selection
        if (!inverse) {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            selection.addRange(range);
        }
        else if (browserUtils.isIE) {
            range.setStart(endNode, endOffset);
            range.setEnd(startNode, startOffset);
            selection.addRange(range);
        }
        else {
            range.setStart(startNode, startOffset);
            range.setEnd(startNode, startOffset);
            selection.addRange(range);

            const shouldCutEndOffset = browserUtils.isSafari || browserUtils.isChrome && browserUtils.version < 58;

            const extendSelection = (node, offset) => {
                // NODE: in some cases in Firefox extend method raises error so we use try-catch
                try {
                    selection.extend(node, offset);
                }
                catch (err) {
                    return false;
                }

                return true;
            };

            if (shouldCutEndOffset && contentEditable.isInvisibleTextNode(endNode)) {
                if (!extendSelection(endNode, Math.min(endOffset, 1)))
                    extendSelection(endNode, 0);
            }
            else
                extendSelection(endNode, endOffset);
        }
    };

    selectionSandbox.wrapSetterSelection(parentElement, selectionSetter, needFocus, true);
}

function deleteSelectionRanges (el) {
    const selection  = getSelectionByElement(el);
    const rangeCount = selection.rangeCount;

    if (!rangeCount)
        return;

    for (let i = 0; i < rangeCount; i++)
        selection.getRangeAt(i).deleteContents();
}

export function deleteSelectionContents (el, selectAll) {
    const startSelection = getSelectionStart(el);
    const endSelection   = getSelectionEnd(el);


    if (selectAll)
        selectContentEditable(el);

    if (startSelection === endSelection)
        return;

    // NOTE: If selection is not contain initial and final invisible symbols
    //we should select its
    correctContentEditableSelectionBeforeDelete(el);

    deleteSelectionRanges(el);

    const selection = getSelectionByElement(el);
    let range     = null;

    //NOTE: We should try to do selection collapsed
    if (selection.rangeCount && !selection.getRangeAt(0).collapsed) {
        range = selection.getRangeAt(0);
        range.collapse(true);
    }
}

export function setCursorToLastVisiblePosition (el) {
    const position = contentEditable.getLastVisiblePosition(el);

    selectContentEditable(el, position, position);
}

export function hasElementContainsSelection (el) {
    const selection = getSelectionByElement(el);

    return selection.anchorNode && selection.focusNode ?
        domUtils.isElementContainsNode(el, selection.anchorNode) &&
           domUtils.isElementContainsNode(el, selection.focusNode) :
        false;
}
