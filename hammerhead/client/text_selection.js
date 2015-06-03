HammerheadClient.define('TextSelection', function (require, exports) {
    var $ = require('jQuery'),
        ContentEditableHelper = require('ContentEditableHelper'),
        EventSandbox = require('DOMSandbox.Event'),
        NativeMethods = require('DOMSandbox.NativeMethods'),
        Util = require('Util');

    //NOTE: we can't determine selection direction in ie from dom api. Therefore we should listen selection changes,
    // and calculate direction using it.
    var BACKWARD_SELECTION_DIRECTION = 'backward',
        FORWARD_SELECTION_DIRECTION = 'forward',
        NONE_SELECTION_DIRECTION = 'none';

    var selectionDirection = NONE_SELECTION_DIRECTION,

        initialLeft = 0,
        initialTop = 0,
        lastSelectionHeight = 0,
        lastSelectionLeft = 0,
        lastSelectionLength = 0,
        lastSelectionTop = 0;

    function stateChanged(left, top, height, width, selectionLength) {
        if (!selectionLength) {
            initialLeft = left;
            initialTop = top;
            selectionDirection = NONE_SELECTION_DIRECTION;
        } else {
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
                        (top === lastSelectionTop && height === lastSelectionHeight && selectionLength > lastSelectionLength) &&
                            (left + width) !== initialLeft) {

                        break;
                    } else if (left < lastSelectionLeft || top < lastSelectionTop)
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
        lastSelectionLeft = left;
        lastSelectionLength = selectionLength;
        lastSelectionTop = top;
    }

    function onSelectionChange() {
        var activeElement = null,
            endSelection = null,
            range = null,
            startSelection = null;

        try {
            if (this.selection)
                range = this.selection.createRange();
            else {
                //HACK: we need do this for IE11 because otherwise we can not get TextRange properties
                activeElement = this.activeElement;

                if (!activeElement || !Util.isTextEditableElement(activeElement)) {
                    selectionDirection = NONE_SELECTION_DIRECTION;

                    return;
                } else {
                    startSelection = exports.getSelectionStart(activeElement);
                    endSelection = exports.getSelectionEnd(activeElement);
                    range = activeElement.createTextRange();
                    range.collapse(true);
                    range.moveStart('character', startSelection);
                    range.moveEnd('character', endSelection - startSelection);
                }
            }
        } catch (e) {
            //NOTE: in ie it raises error when there are not a real selection
            selectionDirection = NONE_SELECTION_DIRECTION;

            return;
        }

        stateChanged(range.offsetLeft, range.offsetTop, range.boundingHeight, range.boundingWidth,
            range.htmlText ? range.htmlText.length : 0);
    }

    if (Util.isIE)
        NativeMethods.addEventListener.call(document, 'selectionchange', onSelectionChange, true);

    //utils for contentEditable
    function hasInverseSelectionContentEditable(el) {
        var curDocument = el ? Util.findDocument(el) : document,
            selection = curDocument.getSelection(),
            range = null,
            backward = false;

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

    function selectContentEditable(el, from, to, needFocus, inverse) {
        var endPosition = null,
            firstTextNodeChild = null,
            latestTextNodeChild = null,
            startPosition = null,
            temp = null;

        if (typeof from !== 'undefined' && typeof to !== 'undefined' && from > to) {
            temp = from;
            from = to;
            to = temp;
            inverse = true;
        }

        if (typeof from === 'undefined') {
            firstTextNodeChild = ContentEditableHelper.getFirstVisibleTextNode(el);
            startPosition = {
                node: firstTextNodeChild || el,
                offset: firstTextNodeChild && firstTextNodeChild.nodeValue ?
                    ContentEditableHelper.getFirstNonWhitespaceSymbolIndex(firstTextNodeChild.nodeValue) : 0
            };
        }

        if (typeof to === 'undefined') {
            latestTextNodeChild = ContentEditableHelper.getLastVisibleTextNode(el, true);
            endPosition = {
                node: latestTextNodeChild || el,
                offset: latestTextNodeChild && latestTextNodeChild.nodeValue ?
                    ContentEditableHelper.getLastNonWhitespaceSymbolIndex(latestTextNodeChild.nodeValue) : 0
            };
        }

        startPosition = startPosition || ContentEditableHelper.calculateNodeAndOffsetByPosition(el, from);
        endPosition = endPosition || ContentEditableHelper.calculateNodeAndOffsetByPosition(el, to);

        if (!startPosition.node || !endPosition.node)
            return;

        exports.selectByNodesAndOffsets(startPosition.node, startPosition.offset, endPosition.node, endPosition.offset, needFocus, inverse);
    }

    function correctContentEditableSelectionBeforeDelete(el) {
        var selection = exports.getSelectionByElement(el),

            startNode = selection.anchorNode,
            endNode = selection.focusNode,

            startOffset = selection.anchorOffset,
            endOffset = selection.focusOffset,

            startNodeFirstNonWhitespaceSymbol = ContentEditableHelper.getFirstNonWhitespaceSymbolIndex(startNode.nodeValue),
            startNodeLastNonWhitespaceSymbol = ContentEditableHelper.getLastNonWhitespaceSymbolIndex(startNode.nodeValue),

            endNodeFirstNonWhitespaceSymbol = ContentEditableHelper.getFirstNonWhitespaceSymbolIndex(endNode.nodeValue),
            endNodeLastNonWhitespaceSymbol = ContentEditableHelper.getLastNonWhitespaceSymbolIndex(endNode.nodeValue),

            newStartOffset = null,
            newEndOffset = null;

        if (startNode.nodeType === 3) {
            if (startOffset < startNodeFirstNonWhitespaceSymbol && startOffset !== 0)
                newStartOffset = 0;
            else if (startOffset !== startNode.nodeValue.length && ((ContentEditableHelper.isInvisibleTextNode(startNode) && startOffset !== 0) ||
                (startOffset > startNodeLastNonWhitespaceSymbol)))
                newStartOffset = startNode.nodeValue.length;
        }

        if (endNode.nodeType === 3) {
            if (endOffset < endNodeFirstNonWhitespaceSymbol && endOffset !== 0)
                newEndOffset = 0;
            else if (endOffset !== endNode.nodeValue.length && ((ContentEditableHelper.isInvisibleTextNode(endNode) && endOffset !== 0) ||
                (endOffset > endNodeLastNonWhitespaceSymbol)))
                newEndOffset = endNode.nodeValue.length;
        }

        if ($.browser.webkit) {
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
            newStartOffset = newStartOffset !== null ? (newStartOffset === 0 ? newStartOffset : startNode.nodeValue.length) : startOffset;
            newEndOffset = newEndOffset !== null ? (newEndOffset === 0 ? newEndOffset : endNode.nodeValue.length) : endOffset;
            exports.selectByNodesAndOffsets(startNode, newStartOffset, endNode, newEndOffset);
        }
    }

    function correctRectangle(currentRect, options) {
        var documentScroll = options.documentScroll,
            iFrameDocumentScroll = options.iFrameDocumentScroll,
            iFrameOffset = options.iFrameOffset,
            iFramePadding = options.iFramePadding,
            iFrameBorders = options.iFrameBorders,

            currentRectHeight = currentRect.top + options.elementHeight - 1,

            clientOffset = null,

            currentLeft = null,
            currentTop = null,
            currentBottom = null;

        if (Util.isIE && !Util.isIE11 && options.isInProcessedIFrame) {
            if (Util.browserVersion === 9 && !options.isContentEditable) {
                currentLeft = Math.ceil(currentRect.left) + options.windowTopScroll.left - options.crossDomainIFrameOffset.left - options.crossDomainIFrameBorders.left - options.crossDomainIFramePadding.left;
                currentTop = Math.ceil(currentRect.top) + options.windowTopScroll.top - options.crossDomainIFrameOffset.top - options.crossDomainIFrameBorders.top - options.crossDomainIFramePadding.top;
                currentBottom = Math.ceil(currentRect.bottom) + options.windowTopScroll.top - options.crossDomainIFrameOffset.top - options.crossDomainIFrameBorders.top - options.crossDomainIFramePadding.top;
            } else if (Util.browserVersion === 10 || options.isContentEditable) {
                currentLeft = Math.ceil(currentRect.left);
                currentTop = Math.ceil(currentRect.top);
                currentBottom = Math.ceil(currentRect.bottom);
            }
        } else {
            if (options.isTextarea) {
                currentLeft = Math.ceil(currentRect.left);
                currentTop = Math.ceil(currentRect.top);
                currentBottom = Math.ceil(currentRect.bottom);
            } else {
                if (options.isInIFrame && (options.isContentEditable || Util.isIE)) {
                    clientOffset = options.elementOffset;
                    clientOffset.left -= (iFrameOffset.left + iFrameBorders.left + iFramePadding.left);
                    clientOffset.top -= (iFrameOffset.top + iFrameBorders.top + iFramePadding.top);
                    clientOffset = Util.offsetToClientCoords({x: clientOffset.left, y: clientOffset.top});
                } else
                    clientOffset = Util.offsetToClientCoords({x: options.elementOffset.left, y: options.elementOffset.top});

                currentLeft = Math.ceil(Math.ceil(currentRect.left) <= clientOffset.x ? clientOffset.x + options.elementBorders.left + 1 : currentRect.left);
                currentTop = Math.ceil(Math.ceil(currentRect.top) <= clientOffset.y ? clientOffset.y + options.elementBorders.top + 1 : currentRect.top);
                currentBottom = Math.floor(Math.floor(currentRect.bottom) >= (clientOffset.y + options.elementBorders.top + options.elementBorders.bottom + options.elementHeight) ? currentRectHeight : currentRect.bottom);
            }
        }

        if (options.isInIFrame && (options.isContentEditable || (Util.isIE && Util.browserVersion !== 9))) {
            currentLeft = currentLeft + iFrameDocumentScroll.left + iFrameOffset.left + iFrameBorders.left + iFramePadding.left;
            currentTop = currentTop + iFrameDocumentScroll.top + iFrameOffset.top + iFrameBorders.top + iFramePadding.top;
            currentBottom = currentBottom + iFrameDocumentScroll.top + iFrameOffset.top + iFrameBorders.top + iFramePadding.top;
        } else if (options.isInIFrame && Util.isIE && Util.browserVersion === 9) {
            currentLeft = currentLeft + iFrameDocumentScroll.left + documentScroll.left;
            currentTop = currentTop + iFrameDocumentScroll.top + documentScroll.top;
            currentBottom = currentBottom + iFrameDocumentScroll.top + documentScroll.top;
        } else if (options.isContentEditable || (Util.isIE && !Util.isIE11)) {
            currentLeft = currentLeft + documentScroll.left;
            currentTop = currentTop + documentScroll.top;
            currentBottom = currentBottom + documentScroll.top;
        } else {
            currentLeft = currentLeft + documentScroll.left + iFrameDocumentScroll.left;
            currentTop = currentTop + documentScroll.top + iFrameDocumentScroll.top;
            currentBottom = currentBottom + documentScroll.top + iFrameDocumentScroll.top;
        }

        return {
            bottom: currentBottom,
            left: currentLeft,
            top: currentTop
        };
    }

    //API
    exports.getSelectionStart = function (el) {
        var selection = null;

        if (!Util.isContentEditableElement(el))
            return EventSandbox.getSelection(el).start;

        if (exports.hasElementContainsSelection(el)) {
            selection = exports.getSelectionByElement(el);

            return ContentEditableHelper.getSelectionStartPosition(el, selection, hasInverseSelectionContentEditable(el));
        }

        return 0;
    };

    exports.getSelectionEnd = function (el) {
        var selection = null;

        if (!Util.isContentEditableElement(el))
            return EventSandbox.getSelection(el).end;

        if (exports.hasElementContainsSelection(el)) {
            selection = exports.getSelectionByElement(el);

            return ContentEditableHelper.getSelectionEndPosition(el, selection, hasInverseSelectionContentEditable(el));
        }

        return 0;
    };

    exports.getSelectedText = function (el) {
        return el.value.substring(exports.getSelectionStart(el), exports.getSelectionEnd(el));
    };

    exports.hasInverseSelection = function (el) {
        if (Util.isContentEditableElement(el))
            return hasInverseSelectionContentEditable(el);

        return (EventSandbox.getSelection(el).direction || selectionDirection) === BACKWARD_SELECTION_DIRECTION;
    };

    exports.hasInverseSelectionContentEditable = hasInverseSelectionContentEditable;

    exports.getSelectionByElement = function (el) {
        var currentDocument = Util.findDocument(el);

        return currentDocument ? currentDocument.getSelection() : window.getSelection();
    };

    exports.getPositionCoordinates = function (el, position, correctOptions) {
        var range = null,
            rects = null,
            selectionPosition = null,
            rect = null,

            isTextarea = el.tagName.toLowerCase() === 'textarea',
            isContentEditable = Util.isContentEditableElement(el),
            offset = Util.getOffsetPosition(el);

        //NOTE: we don't create fake div element for contentEditable elements
        //because we can get the selection dimensions directly
        if (isContentEditable) {
            range = Util.findDocument(el).createRange();
            selectionPosition = ContentEditableHelper.calculateNodeAndOffsetByPosition(el, position);

            range.setStart(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));
            range.setEnd(selectionPosition.node, Math.min(selectionPosition.offset, selectionPosition.node.length));
            rect = range.getClientRects()[0];

            return rect ? correctRectangle(rect, correctOptions) : null;
        }

        //NOTE: for IE
        if (typeof el.createTextRange === "function") {
            range = el.createTextRange();
            range.collapse(true);
            range.moveStart('character', position);
            range.moveEnd('character', position);
            range.collapse(true);
            rect = range.getBoundingClientRect();

            return rect ? correctRectangle(rect, correctOptions) : null;
        }

        var $body = $(document).find('body'),
            bodyMargin = Util.getElementMargin($body),
            bodyLeft = null,
            bodyTop = null,
            elementMargin = Util.getElementMargin($(el)),
            elementTop = offset.top - elementMargin.top,
            elementLeft = offset.left - elementMargin.left,
            width = el.scrollWidth,

            $fakeDiv = $('<div></div>'),
            fakeDivCssStyles = 'white-space:pre-wrap;border-style:solid;',
            listOfModifiers = ['direction', 'font-family', 'font-size', 'font-size-adjust', 'font-variant', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-align', 'text-indent', 'text-transform', 'word-wrap', 'word-spacing', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom', 'border-top-width', 'border-left-width', 'border-right-width', 'border-bottom-width'];

        if (Util.getCssStyleValue($body[0], 'position') === 'absolute') {
            elementLeft -= bodyMargin.left;
            elementTop -= bodyMargin.top;
            bodyLeft = Util.getCssStyleValue($body[0], 'left');

            if (bodyLeft !== 'auto')
                elementLeft -= parseInt(bodyLeft.replace('px', ''));

            bodyTop = Util.getCssStyleValue($body[0], 'top');

            if (bodyTop !== 'auto')
                elementTop -= parseInt(bodyTop.replace('px', ''));
        }

        $.each(listOfModifiers, function (index, value) {
            fakeDivCssStyles += value + ':' + Util.getCssStyleValue(el, value) + ';';
        });

        $fakeDiv.appendTo($body);

        try {
            $fakeDiv.css({
                cssText: fakeDivCssStyles,
                position: 'absolute',
                top: elementTop,
                left: elementLeft,
                width: width,
                height: el.scrollHeight
            });

            $fakeDiv[0].textContent = !el.value.length ? ' ' : el.value;

            range = document.createRange(); //B254723
            range.setStart($fakeDiv[0].firstChild, Math.min(position, el.value.length));
            range.setEnd($fakeDiv[0].firstChild, Math.min(position, el.value.length));

            if (isTextarea) {
                rects = range.getClientRects();
                rect = range.getBoundingClientRect();

                if (rect.width === 0 && rect.height === 0)
                    rect = rects[0];
            } else
                rect = range.getClientRects()[0];

            $fakeDiv.remove();
        } catch (err) {
            $fakeDiv.remove();

            return {};
        }

        return rect ? correctRectangle(rect, correctOptions) : null;
    };

    exports.select = function (el, from, to, inverse) {
        if (Util.isContentEditableElement(el)) {
            selectContentEditable(el, from, to, true, inverse);

            return;
        }

        var start = from || 0,
            end = typeof to === 'undefined' ? el.value.length : to,
            temp = null;

        if (start > end) {
            temp = start;
            start = end;
            end = temp;
            inverse = true;
        }

        EventSandbox.setSelection(el, start, end, inverse ? BACKWARD_SELECTION_DIRECTION : FORWARD_SELECTION_DIRECTION);

        selectionDirection = from === to ?
            NONE_SELECTION_DIRECTION :
            inverse ? BACKWARD_SELECTION_DIRECTION : FORWARD_SELECTION_DIRECTION;
    };

    exports.selectByNodesAndOffsets = function (startNode, startOffset, endNode, endOffset, needFocus, inverse) {
        var parentElement = ContentEditableHelper.findContentEditableParent(startNode),
            curDocument = Util.findDocument(parentElement),
            selection = exports.getSelectionByElement(parentElement),
            range = curDocument.createRange(),

            startNodeLength = startNode.nodeValue ? startNode.length : 0,
            endNodeLength = endNode.nodeValue ? endNode.length : 0;

        var selectionSetter = function () {
            selection.removeAllRanges();

            //NOTE: For IE we can't create inverse selection
            if (!inverse || Util.isIE) {
                range.setStart(startNode, Math.min(startNodeLength, startOffset));
                range.setEnd(endNode, Math.min(endNodeLength, endOffset));
                selection.addRange(range);
            } else {
                range.setStart(endNode, Math.min(endNodeLength, endOffset));
                range.setEnd(endNode, Math.min(endNodeLength, endOffset));
                selection.addRange(range);

                if ($.browser.webkit && ContentEditableHelper.isInvisibleTextNode(startNode)) {
                    try {
                        selection.extend(startNode, Math.min(startOffset, 1));
                    } catch (err) {
                        selection.extend(startNode, 0);
                    }
                } else
                    selection.extend(startNode, Math.min(startNodeLength, startOffset));
            }
        };

        EventSandbox.wrapSetterSelection(parentElement, selectionSetter, needFocus, true);
    };

    exports.deleteSelectionContents = function (el, selectAll) {
        var startSelection = exports.getSelectionStart(el),
            endSelection = exports.getSelectionEnd(el);

        function deleteSelectionRanges(el) {
            var selection = exports.getSelectionByElement(el),
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

        var selection = exports.getSelectionByElement(el),
            range = null;

        //NOTE: We should try to do selection collapsed
        if (selection.rangeCount && !selection.getRangeAt(0).collapsed) {
            range = selection.getRangeAt(0);
            range.collapse(true);
        }
    };

    exports.setCursorToLastVisiblePosition = function (el) {
        var position = ContentEditableHelper.getLastVisiblePosition(el);

        selectContentEditable(el, position, position);
    };

    exports.hasElementContainsSelection = function (el) {
        var selection = exports.getSelectionByElement(el);

        return selection.anchorNode && selection.focusNode ?
            Util.isElementContainsNode(el, selection.anchorNode) && Util.isElementContainsNode(el, selection.focusNode) :
            false;
    };
});