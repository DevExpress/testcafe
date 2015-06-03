/* global isIFrameWithoutSrc:true */
HammerheadClient.define('Util.Position', function (require, exports) {
    var $ = require('jQuery'),
        Browser = require('Util.Browser'),
        DOM = require('Util.DOM'),
        Style = require('Util.Style');

    function getAreaElementRectangle(el, mapContainer) {
        var shape = el.getAttribute('shape'),
            coords = el.getAttribute('coords'),
            i = 0;

        if (shape === 'default')
            return exports.getElementRectangle(mapContainer);

        if (!shape || !coords)
            return null;

        coords = coords.split(',');

        if (!coords.length)
            return null;

        for (i = 0; i < coords.length; i++) {
            coords[i] = parseInt(coords[i]);

            if (typeof coords[i] !== 'number')
                return null;
        }

        var rectangle = {};

        switch (shape) {
            case 'rect':
                if (coords.length === 4) {
                    rectangle.height = coords[3] - coords[1];
                    rectangle.left = coords[0];
                    rectangle.top = coords[1];
                    rectangle.width = coords[2] - coords[0];
                }

                break;

            case 'circle':
                if (coords.length === 3) {
                    rectangle.height = coords[2] * 2;
                    rectangle.left = coords[0] - coords[2];
                    rectangle.top = coords[1] - coords[2];
                    rectangle.width = coords[2] * 2;
                }

                break;

            case 'poly':
                if (coords.length >= 6 && coords.length % 2 === 0) {
                    rectangle.left = rectangle.right = coords[0];
                    rectangle.top = rectangle.bottom = coords[1];

                    for (i = 2; i < coords.length; i = i + 2) {
                        rectangle.left = coords[i] < rectangle.left ? coords[i] : rectangle.left;
                        rectangle.right = coords[i] > rectangle.right ? coords[i] : rectangle.right;
                    }

                    for (i = 3; i < coords.length; i = i + 2) {
                        rectangle.top = coords[i] < rectangle.top ? coords[i] : rectangle.top;
                        rectangle.bottom = coords[i] > rectangle.bottom ? coords[i] : rectangle.bottom;
                    }

                    rectangle.height = rectangle.bottom - rectangle.top;
                    rectangle.width = rectangle.right - rectangle.left;
                }

                break;
        }

        if (!$.isEmptyObject(rectangle)) {
            var containerOffset = exports.getOffsetPosition(mapContainer);

            rectangle.left += containerOffset.left;
            rectangle.top += containerOffset.top;

            return rectangle;
        }

        return null;
    }

    function getMapElementRectangle(el) {
        var mapContainer = DOM.getMapContainer(el);

        if (mapContainer) {
            if (/^map$/i.test(el.tagName))
                return exports.getElementRectangle(mapContainer);
            else if (/^area$/i.test(el.tagName)) {
                var areaElementRectangle = getAreaElementRectangle(el, mapContainer);

                if (areaElementRectangle)
                    return areaElementRectangle;
            }
        }

        return {
            height: 0,
            left: 0,
            top: 0,
            width: 0
        };
    }

    exports.checkPresenceInRectangle = function (point, rectangle) {
        return point.x >= rectangle.left && point.x <= rectangle.right && point.y >= rectangle.top && point.y <= rectangle.bottom;
    };

    // TODO: equal to offsetToClientCoords
    exports.clientToOffsetCoord = function (coords, currentDocument) {
        var $doc = $(currentDocument || document);

        return {
            x: coords.x + $doc.scrollLeft(),
            y: coords.y + $doc.scrollTop()
        };
    };

    exports.getClientDimensions = function (target) {
        if (!DOM.isDomElement(target)) {
            var clientPoint = exports.offsetToClientCoords(target);

            return {
                border: {
                    bottom: 0,
                    left: 0,
                    right: 0,
                    top: 0
                },
                bottom: clientPoint.y,
                height: 0,
                left: clientPoint.x,
                right: clientPoint.x,
                scroll: {
                    left: 0,
                    top: 0
                },
                top: clientPoint.y,
                width: 0
            };
        }

        var $target = $(target),
            isHtmlElement = /html/i.test(target.tagName),
            body = isHtmlElement ? $target.find('body')[0] : null,
            elementBorders = Style.getBordersWidth($target),
            elementRect = target.getBoundingClientRect(),
            elementScroll = Style.getElementScroll($target),
            isElementInIFrame = DOM.isElementInIframe(target),
            elementLeftPosition = isHtmlElement ? 0 : elementRect.left,
            elementTopPosition = isHtmlElement ? 0 : elementRect.top,
            elementHeight = isHtmlElement ? target.clientHeight : elementRect.height,
            elementWidth = isHtmlElement ? target.clientWidth : elementRect.width;

        if (isHtmlElement && isIFrameWithoutSrc && body) {
            elementHeight = body.clientHeight;
            elementWidth = body.clientWidth;
        }

        if (isElementInIFrame) {
            var iFrameElement = DOM.getIFrameByElement(target);

            if (iFrameElement) {
                var iFrameOffset = exports.getOffsetPosition(iFrameElement),
                    clientOffset = exports.offsetToClientCoords({
                        x: iFrameOffset.left,
                        y: iFrameOffset.top
                    }),
                    iFrameBorders = Style.getBordersWidth($(iFrameElement));

                elementLeftPosition += clientOffset.x + iFrameBorders.left;
                elementTopPosition += clientOffset.y + iFrameBorders.top;

                if (isHtmlElement) {
                    elementBorders.bottom = elementBorders.bottom + iFrameBorders.bottom;
                    elementBorders.left = elementBorders.left + iFrameBorders.left;
                    elementBorders.right = elementBorders.right + iFrameBorders.right;
                    elementBorders.top = elementBorders.top + iFrameBorders.top;
                }
            }
        }

        return {
            border: elementBorders,
            bottom: elementTopPosition + elementHeight,
            height: elementHeight,
            left: elementLeftPosition,
            right: elementLeftPosition + elementWidth,
            scroll: {
                left: elementScroll.left,
                top: elementScroll.top
            },
            scrollbar: {
                right: isHtmlElement || $target.innerWidth() === target.clientWidth ? 0 : DOM.getScrollbarSize(),
                bottom: isHtmlElement || $target.innerHeight() === target.clientHeight ? 0 : DOM.getScrollbarSize()
            },
            top: elementTopPosition,
            width: elementWidth
        };
    };

    exports.getElementClientRectangle = function (el) {
        var rect = exports.getElementRectangle(el),
            clientPos = exports.offsetToClientCoords({
                x: rect.left,
                y: rect.top
            });

        return {
            height: rect.height,
            left: clientPos.x,
            top: clientPos.y,
            width: rect.width
        };
    };

    //TODO: remove the skipIFramesDeeping flag
    exports.getElementFromPoint = function (x, y, currentDocument, skipIFramesDeeping) {
        var el = null;

        currentDocument = currentDocument || document;

        try {
            // Permission denied to access property 'getElementFromPoint' error in iFrame
            el = (currentDocument.getElementFromPoint || currentDocument.elementFromPoint).call(currentDocument, x, y);
        } catch (ex) {
            return null;
        }

        //NOTE: elementFromPoint returns null when is's a border of an iframe
        if (el === null)
            el = (currentDocument.getElementFromPoint || currentDocument.elementFromPoint).call(currentDocument, x - 1, y - 1);

        if (el && el.tagName.toLowerCase() === 'iframe' && !skipIFramesDeeping) {
            var iframeDocument = null;

            try {
                iframeDocument = $(el).contents()[0];
            } catch (e) {
                //cross-domain iframe
            }

            if (iframeDocument) {
                var iframePosition = exports.getOffsetPosition(el),
                    iframeClientPosition = exports.offsetToClientCoords({
                        x: iframePosition.left,
                        y: iframePosition.top
                    }, currentDocument),
                    iframeBorders = Style.getBordersWidth($(el)),
                    iframePadding = Style.getElementPadding($(el));

                el = exports.getElementFromPoint(
                    x - iframeClientPosition.x - iframeBorders.left - iframePadding.left,
                    y - iframeClientPosition.y - iframeBorders.top - iframePadding.top,
                    iframeDocument
                ) || el;
            }
        }

        return el;
    };

    exports.getElementRectangle = function (el) {
        var rectangle = {};

        if (DOM.isMapElement(el))
            rectangle = getMapElementRectangle(el);
        else if (Style.isVisibleChild(el))
            rectangle = exports.getSelectChildRectangle(el);
        else {
            var elementOffset = exports.getOffsetPosition(el),
                relativeRectangle = DOM.isSvgElement(el) ? exports.getSvgElementRelativeRectangle(el) : el.getBoundingClientRect();

            rectangle = {
                height: relativeRectangle.height,
                left: elementOffset.left,
                top: elementOffset.top,
                width: relativeRectangle.width
            };
        }

        rectangle.height = Math.round(rectangle.height);
        rectangle.left = Math.round(rectangle.left);
        rectangle.top = Math.round(rectangle.top);
        rectangle.width = Math.round(rectangle.width);

        return rectangle;
    };

    exports.getElementRectangleForMarking = function (element, padding, borderWidth) {
        var elementRectangle = exports.getElementRectangle(element),
            rectPadding = padding || 0,
            top = elementRectangle.top - rectPadding < 0 ? borderWidth / 2 : elementRectangle.top - rectPadding,
            left = elementRectangle.left - rectPadding < 0 ? borderWidth / 2 : elementRectangle.left - rectPadding,

            width = Math.min(
                elementRectangle.left - rectPadding < 0 ?
                    Math.max(elementRectangle.width + elementRectangle.left + rectPadding - left, 0) :
                    elementRectangle.width + rectPadding * 2,
                Style.getDocumentElementWidth() - borderWidth <= 1 ? 1 : Style.getDocumentElementWidth() - borderWidth),

            height = Math.min(
                elementRectangle.top - rectPadding < 0 ?
                    Math.max(elementRectangle.height + elementRectangle.top + rectPadding - top, 0) :
                    elementRectangle.height + rectPadding * 2,
                Style.getDocumentElementHeight() - borderWidth <= 1 ? 1 : Style.getDocumentElementHeight() - borderWidth);

        return {
            height: height,
            left: left,
            top: top,
            width: width
        };
    };

    exports.getEventAbsoluteCoordinates = function (ev) {
        var el = ev.target || ev.srcElement,
            pageCoordinates = exports.getEventPageCoordinates(ev),
            curDocument = DOM.findDocument(el),
            xOffset = 0,
            yOffset = 0;

        if (DOM.isElementInIframe(curDocument.documentElement)) {
            var currentIFrame = DOM.getIFrameByElement(curDocument);

            if (currentIFrame) {
                var iFrameOffset = exports.getOffsetPosition(currentIFrame),
                    iFrameBorders = Style.getBordersWidth($(currentIFrame));

                xOffset = iFrameOffset.left + iFrameBorders.left;
                yOffset = iFrameOffset.top + iFrameBorders.top;
            }
        }

        return {
            x: pageCoordinates.x + xOffset,
            y: pageCoordinates.y + yOffset
        };
    };

    exports.getEventPageCoordinates = function (ev) {
        var curCoordObject = /^touch/.test(ev.type) && ev.targetTouches ? (ev.targetTouches[0] || ev.changedTouches[0]) : ev;

        if ((curCoordObject.pageX === null || (curCoordObject.pageX === 0 && curCoordObject.pageY === 0 &&
            (curCoordObject.clientX !== 0 || curCoordObject.clientY !== 0))) && curCoordObject.clientX !== null) {

            var currentDocument = DOM.findDocument(ev.target || ev.srcElement),
                html = currentDocument.documentElement,
                body = currentDocument.body;

            return {
                x: Math.round(curCoordObject.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0)),
                y: Math.round(curCoordObject.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0))
            };
        }
        return {
            x: Math.round(curCoordObject.pageX),
            y: Math.round(curCoordObject.pageY)
        };
    };

    exports.getFixedPosition = function (pos, iFrameWin, convertToClient) {
        if (!iFrameWin)
            return pos;

        var iFrame = DOM.getIFrameByWindow(iFrameWin),
            iFrameOffset = exports.getOffsetPosition(iFrame),
            iFrameBorders = Style.getBordersWidth($(iFrame)),
            iFramePadding = Style.getElementPadding($(iFrame)),
            documentScroll = Style.getElementScroll($(document));

        return {
            x: pos.x + iFrameOffset.left + iFrameBorders.left + iFramePadding.left - (convertToClient ? documentScroll.left : 0),
            y: pos.y + iFrameOffset.top + iFrameBorders.top + iFramePadding.top - (convertToClient ? documentScroll.top : 0)
        };
    };

    exports.getFixedPositionForIFrame = function (pos, iFrameWin) {
        var iFrame = DOM.getIFrameByWindow(iFrameWin),
            iFrameOffset = exports.getOffsetPosition(iFrame),
            iFrameBorders = Style.getBordersWidth($(iFrame)),
            iFramePadding = Style.getElementPadding($(iFrame));

        return {
            x: pos.x - iFrameOffset.left - iFrameBorders.left - iFramePadding.left,
            y: pos.y - iFrameOffset.top - iFrameBorders.top - iFramePadding.top
        };
    };

    exports.getIFrameCoordinates = function (iFrameWin) {
        var iFrame = DOM.getIFrameByWindow(iFrameWin),
            $IFrame = $(iFrame),
            iFrameOffset = exports.getOffsetPosition(iFrame),
            iFrameBorders = Style.getBordersWidth($IFrame),
            iFramePadding = Style.getElementPadding($IFrame),
            iFrameRectangleLeft = iFrameOffset.left + iFrameBorders.left + iFramePadding.left,
            iFrameRectangleTop = iFrameOffset.top + iFrameBorders.top + iFramePadding.top;

        return {
            bottom: iFrameRectangleTop + $IFrame.height(),
            left: iFrameRectangleLeft,
            right: iFrameRectangleLeft + $IFrame.width(),
            top: iFrameRectangleTop
        };
    };

    exports.getOffsetPosition = function (el) {
        if (DOM.isMapElement(el)) {
            var rectangle = getMapElementRectangle(el);

            return {
                left: rectangle.left,
                top: rectangle.top
            };
        }

        var doc = DOM.findDocument(el),
            isInIFrame = DOM.isElementInIframe(el, doc),
            currentIFrame = isInIFrame ? DOM.getIFrameByElement(doc) : null,
            offsetPosition = doc === el ? $(doc.documentElement).offset() : $(el).offset(),
            relativeRectangle = null;

        // NOTE: jquery .offset() function doesn't take body's border into account (except IE7)
        // http://bugs.jquery.com/ticket/7948

        //NOTE: Sometimes in IE method getElementFromPoint returns cross-domain iframe's documentElement, but we can't get his body
        var borders = doc.body ? Style.getBordersWidth($(doc.body)) : {
            left: 0,
            top: 0
        };

        if (!isInIFrame || !currentIFrame) {
            var isSvg = DOM.isSvgElement(el);

            relativeRectangle = isSvg ? exports.getSvgElementRelativeRectangle(el) : null;

            return {
                left: Math.round(isSvg ? relativeRectangle.left + borders.left : offsetPosition.left + borders.left),
                top: Math.round(isSvg ? relativeRectangle.top + borders.top : offsetPosition.top + borders.top)
            };
        }

        var iframeBorders = Style.getBordersWidth($(currentIFrame));

        borders.left += iframeBorders.left;
        borders.top += iframeBorders.top;

        var iframeOffset = exports.getOffsetPosition(currentIFrame),
            iframePadding = Style.getElementPadding($(currentIFrame)),
            clientPosition = null;

        if (DOM.isSvgElement(el)) {
            relativeRectangle = exports.getSvgElementRelativeRectangle(el);

            clientPosition = {
                x: relativeRectangle.left - (document.body.scrollLeft || document.documentElement.scrollLeft) + borders.left,
                y: relativeRectangle.top - (document.body.scrollTop || document.documentElement.scrollTop) + borders.top
            };
        } else {
            clientPosition = exports.offsetToClientCoords({
                    x: offsetPosition.left + borders.left,
                    y: offsetPosition.top + borders.top},
                doc);
        }

        return {
            left: Math.round(iframeOffset.left + clientPosition.x + iframePadding.left),
            top: Math.round(iframeOffset.top + clientPosition.y + iframePadding.top)
        };
    };

    exports.getSelectChildRectangle = function (el) {
        var select = DOM.getSelectParent($(el));

        if (select) {
            var $select = $(select),
                selectRectangle = exports.getElementRectangle(select),
                selectBorders = Style.getBordersWidth($select),
                selectRightScrollbar = $select.innerWidth() === select.clientWidth ? 0 : DOM.getScrollbarSize(),
                optionHeight = Style.getOptionHeight($select),
                optionRealIndex = DOM.getChildVisibleIndex($select, el),
                optionVisibleIndex = Math.max(optionRealIndex - $select.scrollTop() / optionHeight, 0);

            return {
                height: optionHeight,
                left: selectRectangle.left + selectBorders.left,
                top: selectRectangle.top + selectBorders.top + Style.getElementPadding($select).top + optionVisibleIndex * optionHeight,
                width: selectRectangle.width - (selectBorders.left + selectBorders.right) - selectRightScrollbar
            };
        }

        return exports.getElementRectangle(el);
    };

    exports.getSvgElementRelativeRectangle = function (el) {
        var $el = $(el),
            isSvgTextElement = $el.is('tspan') || $el.is('tref') || (el.tagName && el.tagName.toLowerCase() === 'textpath'),
            boundingClientRect = el.getBoundingClientRect(),
            elementRect = {
                height: !isSvgTextElement ? boundingClientRect.height : $el.outerHeight(),
                left: boundingClientRect.left + (document.body.scrollLeft || document.documentElement.scrollLeft),
                top: boundingClientRect.top + (document.body.scrollTop || document.documentElement.scrollTop),
                width: !isSvgTextElement ? boundingClientRect.width : $el.outerWidth()
            };

        if (isSvgTextElement) {
            var $offsetParent = $el.offsetParent(),
                elOffset = $el.offset(),
                offsetParentOffset = $offsetParent.offset(),
                offsetParentIsBody = $offsetParent.is('body');

            return {
                height: elementRect.height || boundingClientRect.height,
                left: offsetParentIsBody ? (el.offsetLeft || elOffset.left) : offsetParentOffset.left + el.offsetLeft,
                top: offsetParentIsBody ? (el.offsetTop || elOffset.top) : offsetParentOffset.top + el.offsetTop,
                width: elementRect.width || boundingClientRect.width
            };
        }


        if (Browser.isMozilla || Browser.isIE)
            return elementRect;

        var strokeWidth = $el.attr('stroke-width') || $el.css('stroke-width');

        //NOTE: we think that 'stroke-width' attribute can only be set in pixels
        strokeWidth = strokeWidth ? +strokeWidth.replace(/px|em|ex|pt|pc|cm|mm|in/, '') : 1;

        if (strokeWidth && +(strokeWidth) % 2 !== 0)
            strokeWidth = +strokeWidth + 1;

        if (($el.is('line') || $el.is('polyline') || $el.is('polygon') || $el.is('path')) && (!elementRect.width || !elementRect.height)) {
            if (!elementRect.width && elementRect.height) {
                elementRect.left -= strokeWidth / 2;
                elementRect.width = strokeWidth;
            } else if (elementRect.width && !elementRect.height) {
                elementRect.height = strokeWidth;
                elementRect.top -= strokeWidth / 2;
            }
        } else {
            if ($el.is('polygon')) {
                elementRect.height += 2 * strokeWidth;
                elementRect.left -= strokeWidth;
                elementRect.top -= strokeWidth;
                elementRect.width += 2 * strokeWidth;
            }

            elementRect.height += strokeWidth;
            elementRect.left -= strokeWidth / 2;
            elementRect.top -= strokeWidth / 2;
            elementRect.width += strokeWidth;
        }

        return elementRect;
    };

    exports.findCenter = function (el) {
        var rectangle = exports.getElementRectangle(el);

        return {
            x: Math.round(rectangle.left + rectangle.width / 2),
            y: Math.round(rectangle.top + rectangle.height / 2)
        };
    };

    exports.findClientCenter = function (el) {
        return exports.offsetToClientCoords(exports.findCenter(el));
    };

    exports.findLineAndRectangelIntersection = function (pointStart, pointEnd, rectangle) {
        var points = [];

        var getLineYByXCoord = function (x) {
            if (pointEnd.x - pointStart.x === 0)
                return null;

            return pointStart.y + (x * (pointEnd.y - pointStart.y) + pointStart.x * (pointStart.y - pointEnd.y)) / (pointEnd.x - pointStart.x);
        };

        var getLineXByYCoord = function (y) {
            if (pointEnd.y - pointStart.y === 0)
                return null;

            return pointStart.x + (y * (pointEnd.x - pointStart.x) + pointStart.y * (pointStart.x - pointEnd.x)) / (pointEnd.y - pointStart.y);
        };

        var getDistanceBetweenPoints = function (start, end) {
            return Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        };

        var findTransfer = function (coord, isHorizontalSide) {
            var intersection = isHorizontalSide ? getLineXByYCoord(coord) : getLineYByXCoord(coord),
                hasTransfer = intersection && (isHorizontalSide ? (intersection >= rectangle.left && intersection <= rectangle.right) :
                    (intersection >= rectangle.top && intersection <= rectangle.bottom));

            if (hasTransfer) {
                points.push({
                    x: isHorizontalSide ? Math.round(intersection) : Math.round(coord),
                    y: isHorizontalSide ? Math.round(coord) : Math.round(intersection)
                });
            }
        };

        for (var prop in rectangle) {
            if (rectangle.hasOwnProperty(prop))
                findTransfer(rectangle[prop], /top|bottom/.test(prop));
        }

        return points.length === 1 || getDistanceBetweenPoints(pointStart, points[0]) < getDistanceBetweenPoints(pointStart, points[1]) ?
            points[0] : points[1];
    };

    exports.isContainOffset = function (el, offsetX, offsetY) {
        var dimensions = exports.getClientDimensions(el),
            maxX = dimensions.scrollbar.right + dimensions.border.left + dimensions.border.right + el.scrollWidth,
            maxY = dimensions.scrollbar.bottom + dimensions.border.top + dimensions.border.bottom + el.scrollHeight;

        return (typeof offsetX === 'undefined' || (offsetX >= 0 && maxX >= offsetX)) &&
            (typeof offsetY === 'undefined' || ( offsetY >= 0 && maxY >= offsetY));
    };

    exports.isElementVisible = function (el) {
        if (DOM.isTextNode(el))
            return !exports.isNotVisibleNode(el);

        var $el = $(el),
            elementRectangle = exports.getElementRectangle(el);

        if (!DOM.isContentEditableElement(el)) {
            if (elementRectangle.width === 0 || elementRectangle.height === 0)
                return false;
        }

        if (DOM.isMapElement(el)) {
            var mapContainer = DOM.getMapContainer($el.closest('map')[0]);

            return mapContainer ? exports.isElementVisible(mapContainer) : false;
        } else if (Style.isVisibleChild(el)) {
            var $select = $(DOM.getSelectParent($(el))),
                childRealIndex = DOM.getChildVisibleIndex($select, el),
                realSelectSizeValue = Style.getSelectElementSize($select),
                topVisibleIndex = Math.max($select.scrollTop() / Style.getOptionHeight($select), 0),
                bottomVisibleIndex = topVisibleIndex + realSelectSizeValue - 1,
                optionVisibleIndex = Math.max(childRealIndex - topVisibleIndex, 0);

            return optionVisibleIndex >= topVisibleIndex && optionVisibleIndex <= bottomVisibleIndex;
        } else if (DOM.isSvgElement(el))
            return $el.css('visibility') !== 'hidden' && $el.css('display') !== 'none';
        else
            return $el.is(':visible') && $el.css('visibility') !== 'hidden';
    };

    exports.offsetToClientCoords = function (coords, currentDocument) {
        var $doc = $(currentDocument || document);

        return {
            x: coords.x - $doc.scrollLeft(),
            y: coords.y - $doc.scrollTop()
        };
    };
});