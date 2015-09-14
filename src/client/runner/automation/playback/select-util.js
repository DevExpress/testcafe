import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';

var browserUtils   = hammerhead.utils.browser;
var messageSandbox = hammerhead.eventSandbox.message;

var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var domUtils              = testCafeCore.domUtils;
var positionUtils         = testCafeCore.positionUtils;
var styleUtils            = testCafeCore.styleUtils;
var contentEditable       = testCafeCore.contentEditable;
var textSelection         = testCafeCore.textSelection;

function getPointByPosition (el, pos, correctOptions) {
    var selectionCoord = textSelection.getPositionCoordinates(el, pos, correctOptions);

    //NOTE: For position corresponding to the invisible character in contentEditable element
    // method 'getPositionCoordinates' can return empty point
    if (!selectionCoord)
        return;

    var point         = {
        x: selectionCoord.left,
        y: selectionCoord.top + (selectionCoord.bottom - selectionCoord.top) / 2
    };
    var elementScroll = styleUtils.getElementScroll(el);

    if (browserUtils.isIE) {
        point.x += elementScroll.left;
        point.y += elementScroll.top;
    }
    return point;
}

export function getSelectPositionCoordinates (el, start, end, isStartPos, correctOptions) {
    var backward       = start > end,
        selectionStart = textSelection.getPositionCoordinates(el, start, correctOptions),
        selectionEnd   = textSelection.getPositionCoordinates(el, end, correctOptions),
        point          = null;

    if (!isStartPos && start !== end) {
        //NOTE: we do not set pointTo immediately because we take as pointTo last visible point
        // in selectionPath after calculating it
        return selectionEnd ? {
            x: selectionEnd.left,
            y: !backward ? selectionEnd.bottom : selectionEnd.top
        } : null;
    }

    //NOTE: if selection starting from invisible symbol
    if (!selectionStart)
        return positionUtils.findCenter(el);

    if (start !== end)
        point = { x: selectionStart.left, y: !backward ? selectionStart.top : selectionStart.bottom };
    else
        point = { x: selectionStart.left, y: selectionStart.top + (selectionStart.bottom - selectionStart.top) / 2 };

    return point;
}

export function scrollElementByPoint (element, point) {
    var isTextarea = element.tagName.toLowerCase() === 'textarea';

    if (!domUtils.isEditableElement(element))
        return;

    var elementOffset  = positionUtils.getOffsetPosition(element),
        elementBorders = styleUtils.getBordersWidth(element),
        elementScroll  = styleUtils.getElementScroll(element),

        iFrame         = domUtils.getIframeByElement(element),
        iFrameScroll   = iFrame ? styleUtils.getElementScroll(iFrame.contentWindow.document) : null;

    //NOTE: we don't need to scroll input elements in Mozilla,
    // because it happens automatically on selection setting
    // but we can't know input elements' scroll value in Mozilla
    // Bug https://bugzilla.mozilla.org/show_bug.cgi?id=293186
    if ((browserUtils.isFirefox || (browserUtils.isIE && browserUtils.version > 10)) && !isTextarea)
        return;

    var ownOffsetX  = point.x -
                      (elementOffset.left + elementBorders.left + (isTextarea && iFrame ? iFrameScroll.left : 0)),
        ownOffsetY  = point.y -
                      (elementOffset.top + elementBorders.top + (isTextarea && iFrame ? iFrameScroll.top : 0)),
        scrollValue = null;


    if (isTextarea) {
        if (ownOffsetY < elementScroll.top)
            scrollValue = ownOffsetY;
        else if (ownOffsetY > element.clientHeight + elementScroll.top)
            scrollValue = ownOffsetY - element.clientHeight;

        if (scrollValue !== null)
            styleUtils.setScrollTop(element, Math.round(scrollValue));
    }
    else {
        if (ownOffsetX < elementScroll.left)
            scrollValue = ownOffsetX;
        else if (ownOffsetX > element.clientWidth + elementScroll.left)
            scrollValue = ownOffsetX - element.clientWidth;

        if (scrollValue !== null)
            styleUtils.setScrollLeft(element, Math.round(scrollValue));
    }
}

export function updatePointByScrollElement (element, point) {
    var isTextEditable = domUtils.isTextEditableElement(element),
        isTextarea     = element.tagName.toLowerCase() === 'textarea';

    if (!(isTextEditable || domUtils.isContentEditableElement(element)))
        return;

    var left           = point.x,
        top            = point.y,
        elementOffset  = positionUtils.getOffsetPosition(element),
        elementBorders = styleUtils.getBordersWidth(element),
        elementScroll  = styleUtils.getElementScroll(element),
        iFrameScroll   = domUtils.isElementInIframe(element) ? styleUtils.getElementScroll(domUtils.findDocument(element)) : null;

    //NOTE: we doesn't need to scroll input elements in Mozilla,
    // because it happens automatically on selection setting
    //but we can't know input elements' scroll value in Mozilla
    // Bug https://bugzilla.mozilla.org/show_bug.cgi?id=293186
    if (isTextEditable && (browserUtils.isFirefox || (browserUtils.isIE && browserUtils.version > 10)) && !isTextarea) {
        return {
            x: Math.min(left, elementOffset.left + elementBorders.left + element.clientWidth) -
               (iFrameScroll ? iFrameScroll.left : 0),
            y: top - (iFrameScroll ? iFrameScroll.top : 0)
        };
    }

    return {
        x: left - elementScroll.left - (iFrameScroll ? iFrameScroll.left : 0),
        y: top - elementScroll.top - (iFrameScroll ? iFrameScroll.top : 0)
    };
}

export function getProcessedOptions (element, options) {
    var isTextarea            = element.tagName.toLowerCase() === 'textarea',
        isTextEditable        = domUtils.isTextEditableElement(element),
        isContentEditable     = domUtils.isContentEditableElement(element),

        //results for any elements
        startPosition         = null,
        endPosition           = null,

        //for textarea elements
        linesArray            = [],
        startPos              = null,
        endPos                = null,
        startLine             = null,
        endLine               = null,
        startLineIndex        = null,
        endLineIndex          = null,

        isEmptyPropertyObject = typeof options.offset === 'undefined' && typeof options.startPos === 'undefined' &&
                                typeof options.startNode === 'undefined';

    if (isTextarea)
        linesArray = element.value.length ? element.value.split('\n') : [];

    if (isTextEditable) {
        if (!element.value.length)
            startPosition = endPosition = 0;
        else if (typeof options.offset !== 'undefined' || isEmptyPropertyObject) {
            startPosition = 0;

            if (typeof options.offset === 'undefined')
                endPosition = element.value.length;
            else if (options.offset >= 0)
                endPosition = Math.min(options.offset, element.value.length);
            else {
                endPosition   = Math.max(0, element.value.length + options.offset);
                startPosition = element.value.length;
            }
        }
        else if (typeof options.startLine === 'undefined' || !isTextarea) {
            startPosition = Math.min(options.startPos, element.value.length);
            endPosition   = Math.min(options.endPos, element.value.length);
        }
        else {
            if (options.startLine >= linesArray.length) {
                startLineIndex = element.value.length;
                startLine      = linesArray.length - 1;
            }
            else {
                startLine      = options.startLine;
                startLineIndex = domUtils.getTextareaPositionByLineAndOffset(element, startLine, 0);
            }

            if (options.endLine >= linesArray.length) {
                endLineIndex = element.value.length;
                endLine      = linesArray.length - 1;
            }
            else {
                endLine      = options.endLine;
                endLineIndex = domUtils.getTextareaPositionByLineAndOffset(element, endLine, 0);
            }

            startPos      = Math.min(options.startPos, linesArray[startLine].length);
            startPosition = startLineIndex + startPos;

            if (typeof options.endPos === 'undefined') {
                endPos      = linesArray[endLine].length;
                endPosition = endLineIndex + endPos;
            }
            else {
                endPos      = Math.min(options.endPos, linesArray[endLine].length);
                endPosition = endLineIndex + endPos;
            }
        }
    }
    else if (isContentEditable) {
        if (!contentEditable.getContentEditableValue(element).length)
            startPosition = endPosition = 0;
        if (typeof options.startNode !== 'undefined' && typeof options.endNode !== 'undefined') {
            startPosition = contentEditable.getFirstVisiblePosition(options.startNode);
            startPosition = contentEditable.calculatePositionByNodeAndOffset(element, options.startNode, startPosition);
            endPosition   = contentEditable.getLastVisiblePosition(options.endNode);
            endPosition   = contentEditable.calculatePositionByNodeAndOffset(element, options.endNode, endPosition);
            //NOTE: we should revert selection if startNode is actually endNode
            if (startPosition > endPosition) {
                startPosition = contentEditable.getLastVisiblePosition(options.startNode);
                startPosition = contentEditable.calculatePositionByNodeAndOffset(element, options.startNode, startPosition);
                endPosition   = contentEditable.getFirstVisiblePosition(options.endNode);
                endPosition   = contentEditable.calculatePositionByNodeAndOffset(element, options.endNode, endPosition);
            }
        }
        else if (typeof options.offset !== 'undefined' || isEmptyPropertyObject) {
            startPosition = contentEditable.getFirstVisiblePosition(element);
            if (typeof options.offset === 'undefined')
                endPosition = contentEditable.getLastVisiblePosition(element);
            else if (options.offset >= 0)
                endPosition = Math.min(options.offset, contentEditable.getLastVisiblePosition(element));
            else {
                endPosition   = Math.max(0, contentEditable.getLastVisiblePosition(element) + options.offset);
                startPosition = contentEditable.getLastVisiblePosition(element);
            }
        }
        else {
            startPosition = Math.min(options.startPos, contentEditable.getLastVisiblePosition(element));
            endPosition   = Math.min(options.endPos, contentEditable.getLastVisiblePosition(element));
        }
    }

    return {
        startPosition: startPosition,
        endPosition:   endPosition
    };
}

export function getSelectionLastVisiblePosition (el, startPos, endPos, correctOptions) {
    var backward     = startPos > endPos,
        currentPos   = endPos + (backward ? 1 : -1),
        currentPoint = null;

    while (currentPos !== startPos) {
        currentPos   = backward ? currentPos + 1 : currentPos - 1;
        currentPoint = getPointByPosition(el, currentPos, correctOptions);
        if (currentPoint)
            break;
    }
    return currentPoint;
}

export function selectContentEditableByOptions (el, startPosition, endPosition, options) {
    var backward             = startPosition > endPosition,
        startSelectionObject = contentEditable.calculateNodeAndOffsetByPosition(el, startPosition),
        endSelectionObject   = contentEditable.calculateNodeAndOffsetByPosition(el, endPosition),
        startOffset          = null,
        endOffset            = null;

    //NOTE: If the calculated position does not match options we should recalculate it
    if ((options.startNode !== startSelectionObject.node &&
         !domUtils.isElementContainsNode(options.startNode, startSelectionObject.node)) ||
        (options.endNode !== endSelectionObject.node &&
         !domUtils.isElementContainsNode(options.endNode, endSelectionObject.node))) {

        if (backward) {
            startOffset = contentEditable.getLastVisiblePosition(options.startNode);
            endOffset   = contentEditable.getFirstVisiblePosition(options.endNode);
        }
        else {
            startOffset = contentEditable.getFirstVisiblePosition(options.startNode);
            endOffset   = contentEditable.getLastVisiblePosition(options.endNode);
        }

        //NOTE: We should recalculate it because may be necessary select startNode or endNode child nodes
        startSelectionObject = contentEditable.calculateNodeAndOffsetByPosition(options.startNode, startOffset);
        endSelectionObject   = contentEditable.calculateNodeAndOffsetByPosition(options.endNode, endOffset);

        textSelection.selectByNodesAndOffsets(startSelectionObject.node, startSelectionObject.offset, endSelectionObject.node, endSelectionObject.offset, true, backward);
    }
    else
        textSelection.select(el, startPosition, endPosition);
}

export function getCorrectOptions (el, callback) {
    var elementRect       = el.getBoundingClientRect(),
        elementHeight     = el.scrollHeight || elementRect.height,
        isInIFrame        = domUtils.isElementInIframe(el),
        iFrame            = domUtils.getIframeByElement(el),
        windowTopResponse = null,

        options           = {
            isTextarea:           el.tagName.toLowerCase() === 'textarea',
            isContentEditable:    domUtils.isContentEditableElement(el),
            elementBorders:       styleUtils.getBordersWidth(el),
            elementRect:          elementRect,
            //NOTE: strange behavior in Chrome - for some element (e.g. for font tag) scrollHeight is 0,
            //so we get getBoundingClientRect
            elementHeight:        elementHeight,
            elementOffset:        positionUtils.getOffsetPosition(el),
            isInIFrame:           isInIFrame,
            isInProcessedIFrame:  window.top !== window.self,
            iFrame:               iFrame,
            documentScroll:       styleUtils.getElementScroll(document),
            iFrameDocumentScroll: isInIFrame ? styleUtils.getElementScroll(domUtils.findDocument(el)) : {
                left: 0,
                top:  0
            }
        };

    if (isInIFrame) {
        options.iFrame        = domUtils.getIframeByElement(el);
        options.iFrameOffset  = positionUtils.getOffsetPosition(iFrame);
        options.iFrameBorders = styleUtils.getBordersWidth(iFrame);
        options.iFrameMargin  = styleUtils.getElementMargin(iFrame);
        options.iFramePadding = styleUtils.getElementPadding(iFrame);
    }

    if (browserUtils.isIE && browserUtils.version < 11 && options.isInProcessedIFrame) {
        windowTopResponse = function (e) {
            if (e.message.cmd === CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_RESPONSE_CMD) {
                messageSandbox.off(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, windowTopResponse);
                windowTopResponse = null;

                options.windowTopScroll         = e.message.scroll;
                options.crossDomainIFrameOffset = e.message.iFrameOffset;   //TODO: rename property
                options.crossDomainIFrameBorders = e.message.iFrameBorders;
                options.crossDomainIFramePadding = e.message.iFramePadding;
                callback(options);
            }
        };

        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, windowTopResponse);
        messageSandbox.sendServiceMsg({ cmd: CROSS_DOMAIN_MESSAGES.GET_IFRAME_POSITION_DATA_REQUEST_CMD }, window.top);
    }
    else {
        callback(options);
    }
}
