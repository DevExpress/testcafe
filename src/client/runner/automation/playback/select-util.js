import hammerhead from '../../deps/hammerhead';
import testCafeCore from '../../deps/testcafe-core';

var browserUtils   = hammerhead.utils.browser;
var messageSandbox = hammerhead.messageSandbox;

var $                     = testCafeCore.$;
var CROSS_DOMAIN_MESSAGES = testCafeCore.CROSS_DOMAIN_MESSAGES;
var domUtils              = testCafeCore.domUtils;
var positionUtils         = testCafeCore.positionUtils;
var styleUtils            = testCafeCore.styleUtils;
var contentEditable       = testCafeCore.contentEditable;
var textSelection         = testCafeCore.textSelection;


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

        iFrame         = domUtils.getIFrameByElement(element),
        iFrameScroll   = iFrame ? styleUtils.getElementScroll(iFrame.contentWindow.document) : null;

    //NOTE: we don't need to scroll input elements in Mozilla,
    // because it happens automatically on selection setting
    // but we can't know input elements' scroll value in Mozilla
    // Bug https://bugzilla.mozilla.org/show_bug.cgi?id=293186
    if ((browserUtils.isMozilla || (browserUtils.isIE && browserUtils.version > 10)) && !isTextarea)
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
            $(element).scrollTop(Math.round(scrollValue));
    }
    else {
        if (ownOffsetX < elementScroll.left)
            scrollValue = ownOffsetX;
        else if (ownOffsetX > element.clientWidth + elementScroll.left)
            scrollValue = ownOffsetX - element.clientWidth;

        if (scrollValue !== null)
            $(element).scrollLeft(Math.round(scrollValue));
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
    if (isTextEditable && (browserUtils.isMozilla || (browserUtils.isIE && browserUtils.version > 10)) && !isTextarea) {
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
    var isTextarea        = element.tagName.toLowerCase() === 'textarea',
        isTextEditable    = domUtils.isTextEditableElement(element),
        isContentEditable = domUtils.isContentEditableElement(element),

        //results for any elements
        startPosition     = null,
        endPosition       = null,

        //results for textarea elements
        linesArray        = [],
        startPos          = null,
        endPos            = null,
        startLine         = null,
        endLine           = null,
        startLineIndex    = null,
        endLineIndex      = null;

    if (isTextarea)
        linesArray = element.value.length ? element.value.split('\n') : [];

    if (isTextEditable) {
        if (!element.value.length)
            startPosition = endPosition = 0;
        else if (typeof options.offset !== 'undefined' || $.isEmptyObject(options)) {
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
        else if (typeof options.offset !== 'undefined' || $.isEmptyObject(options)) {
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

    //NOTE: we need calculate startLine, endLine, endPos to optimize selection path
    if (isTextarea && typeof options.endLine === 'undefined' && element.value.length) {
        startLine = domUtils.getTextareaLineNumberByPosition(element, startPosition);
        startPos  = domUtils.getTextareaIndentInLine(element, startPosition);
        endLine   = domUtils.getTextareaLineNumberByPosition(element, endPosition);
        endPos    = domUtils.getTextareaIndentInLine(element, endPosition);
    }

    return {
        startPosition: startPosition,
        endPosition:   endPosition,
        startLine:     startLine,
        endLine:       endLine,
        startPos:      startPos,
        endPos:        endPos
    };
}

function getPointByPosition (el, pos, correctOptions) {
    var selectionCoord = textSelection.getPositionCoordinates(el, pos, correctOptions);

    //NOTE: For position corresponding to the invisible character in contentEditable element
    // method 'getPositionCoordinates' can return empty point
    if (!selectionCoord)
        return;

    var point         = {
            x: selectionCoord.left,
            y: selectionCoord.top + (selectionCoord.bottom - selectionCoord.top) / 2
        },
        elementScroll = styleUtils.getElementScroll(el);

    if (browserUtils.isIE) {
        point.x += elementScroll.left;
        point.y += elementScroll.top;
    }
    return point;
}

function getMidpointXCoordinate (y, pointStart, pointEnd) {
    return pointStart.x + ((y - pointStart.y) * (pointEnd.x - pointStart.x)) / (pointEnd.y - pointStart.y);
}

function getOptimizedSelectionPath (path, processedOptions, startPoint, positionCorrect, pointForCorrectionPath) {
    var isRightDirection = processedOptions.endPos > processedOptions.startPos,
        backward         = processedOptions.startPosition > processedOptions.endPosition,
        currentStart     = processedOptions.startPos === 0 && backward ? 2 : 1,
        optimizedPath    = [
            { position: processedOptions.startPosition, point: startPoint }
        ],
        realIndex        = null,
        realPositionX    = null;

    optimizedPath = optimizedPath.concat($.extend(true, [], path));

    function findNextIndexWithRealPoint (afterIndex, moreThen) {
        var lastPart = optimizedPath.slice(afterIndex + 1),
            index    = afterIndex + 1;

        if (!lastPart.length)
            return afterIndex;

        $.each(lastPart, function (i, value) {
                if (isRightDirection) {
                    if (value.point.x > moreThen) {
                        index += i;
                        return false;
                    }
                }
                else if (value.point.x >=
                         getMidpointXCoordinate(lastPart[i].point.y, optimizedPath[0].point, pointForCorrectionPath ===
                                                                                             null ?
                                                                                             optimizedPath[optimizedPath.length -
                                                                                                           1].point :
                                                                                             pointForCorrectionPath)) {
                    index += i;
                    return false;
                }
            }
        );
        return index;
    }

    var i = 0,
        j = 0;

    if (isRightDirection) {
        for (i = currentStart; i < optimizedPath.length; i++) {
            if (optimizedPath[i].point.x < optimizedPath[i - 1].point.x) {
                realIndex = findNextIndexWithRealPoint(i, optimizedPath[i - 1].point.x);

                for (j = i; j < realIndex; j++)
                    optimizedPath[j].point.x = getMidpointXCoordinate(optimizedPath[j].point.y, optimizedPath[i -
                                                                                                              1].point, optimizedPath[realIndex].point);

                i = realIndex;
            }
        }
    }
    else {
        for (i = currentStart; i < optimizedPath.length; i++) {
            //NOTE: if left of the line that connects pointFrom and pointTo
            if (optimizedPath[i].position ===
                (positionCorrect === null ? optimizedPath[optimizedPath.length - 1].position : positionCorrect))
                break;
            else {
                realPositionX = getMidpointXCoordinate(optimizedPath[i].point.y, optimizedPath[0].point, pointForCorrectionPath ===
                                                                                                         null ?
                                                                                                         optimizedPath[optimizedPath.length -
                                                                                                                       1].point :
                                                                                                         pointForCorrectionPath);

                if (optimizedPath[i].point.x < realPositionX) {
                    realIndex = findNextIndexWithRealPoint(i);

                    for (j = i; j < realIndex; j++)
                        optimizedPath[j].point.x = getMidpointXCoordinate(optimizedPath[j].point.y, optimizedPath[i -
                                                                                                                  1].point, optimizedPath[realIndex].point);

                    i = realIndex;
                }
            }
        }
    }

    return optimizedPath;
}

export function getSelectionPath (el, processedOptions, startPoint, endPoint, correctOptions) {
    var isTextarea             = el.tagName.toLowerCase() === 'textarea',

        startPosition          = processedOptions.startPosition,
        endPosition            = processedOptions.endPosition,
        backward               = startPosition > endPosition,
        linesArray             = [],
        startPos               = null,
        endPos                 = null,
        startLine              = null,
        endLine                = null,

        current                = startPosition,
        currentLine            = null,
        currentPos             = null,

        isSelectionRegion      = false,
        selectionPath          = [],

        endPointCorrect        = null,
        positionCorrect        = null,
        pointForCorrectionPath = null;

    function setCorrectPoint (pos) {
        if (isSelectionRegion && pointForCorrectionPath === null) {
            positionCorrect        = pos;
            pointForCorrectionPath = getPointByPosition(el, pos, correctOptions);
        }
    }

    function pushPosition (pos) {
        if (pos === endPosition) {
            selectionPath.push({
                position: endPosition,
                point:    endPoint
            });
        }
        else
            selectionPath.push({
                position: pos,
                point:    getPointByPosition(el, pos, correctOptions)
            });
    }

    if (isTextarea) {
        linesArray = el.value.length ? el.value.split('\n') : [];
        startPos   = processedOptions.startPos;
        endPos     = processedOptions.endPos;
        startLine  = processedOptions.startLine;
        endLine    = processedOptions.endLine;
    }

    if (!isTextarea || startLine === endLine) {
        while (current !== endPosition) {
            current = backward ? current - 1 : current + 1;
            pushPosition(current);
        }
    }
    else {
        currentLine = domUtils.getTextareaLineNumberByPosition(el, current);
        currentPos  = domUtils.getTextareaIndentInLine(el, current);

        while (current !== endPosition) {
            if (currentLine !== endLine) {
                if (!isSelectionRegion)
                    isSelectionRegion = Math.abs(startPosition - endPosition) !== 1;

                currentLine = backward ? currentLine - 1 : currentLine + 1;

                if (currentPos !== endPos) {
                    //NOTE:logic to optimize the mouse movements (during transitions between lines)
                    if (currentLine === endLine && (endPos === 0 || endPos === linesArray[currentLine].length)) {
                        if (selectionPath[selectionPath.length - 1] &&
                            (!(backward &&
                            domUtils.getTextareaIndentInLine(el, selectionPath[selectionPath.length - 1].position) <
                            endPos))) {
                            setCorrectPoint(selectionPath[selectionPath.length -
                                                          1] ? selectionPath[selectionPath.length - 1].position : null);
                        }
                        currentPos = endPos;
                    }
                    else if (!(currentLine !== endLine &&
                               (endPos === 0 || (endPos === linesArray[endLine].length && startPos !== 0))))
                        currentPos = currentPos > endPos ? currentPos - 1 : currentPos + 1;
                }
                //HACK: we can't optimize mouse movements between startPos = endPos = 0 if selection will go on
                //first symbol in the string.
                else if (!browserUtils.isIE && currentLine !== endLine && endPos === 0)
                    currentPos = backward ? 1 : currentPos + 1;

                current = domUtils.getTextareaPositionByLineAndOffset(el, currentLine, Math.min(currentPos, linesArray[currentLine].length));
            }
            else {
                current = current > endPosition ? current - 1 : current + 1;
                setCorrectPoint(current);
            }
            pushPosition(current);
        }
    }

    selectionPath.push({
        position: endPosition,
        point:    endPoint || endPointCorrect
    });

    return !isSelectionRegion ? selectionPath :
           getOptimizedSelectionPath(selectionPath, processedOptions, startPoint, positionCorrect, pointForCorrectionPath);
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
        iFrame            = domUtils.getIFrameByElement(el),
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
        options.iFrame        = domUtils.getIFrameByElement(el);
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
