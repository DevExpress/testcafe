import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeUI from '../deps/testcafe-ui';

var browserUtils     = hammerhead.utils.browser;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var contentEditable = testCafeCore.contentEditable;
var textSelection   = testCafeCore.textSelection;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var styleUtils      = testCafeCore.styleUtils;

var cursor = testCafeUI.cursor;


function focusElementByLabel (label, callback) {
    var doc              = domUtils.findDocument(label);
    var focusableElement = doc.getElementById(label.getAttribute('for'));

    if (focusableElement && domUtils.getActiveElement() !== focusableElement)
        focusBlurSandbox.focus(focusableElement, callback, false, true);
    else if (callback)
        callback();
}

export function getMouseActionPoint (el, actionOptions, convertToScreen) {
    var elementOffset = positionUtils.getOffsetPosition(el),
        left          = el === document.documentElement ? 0 : elementOffset.left,
        top           = el === document.documentElement ? 0 : elementOffset.top,
        elementScroll = styleUtils.getElementScroll(el),
        point         = positionUtils.findCenter(el);

    if (actionOptions && typeof actionOptions.offsetX !== 'undefined' && !isNaN(parseInt(actionOptions.offsetX)))
        point.x = left + (actionOptions.offsetX || 0);

    if (actionOptions && typeof actionOptions.offsetY !== 'undefined' && !isNaN(parseInt(actionOptions.offsetY)))
        point.y = top + (actionOptions.offsetY || 0);

    if (convertToScreen) {
        if (!/html/i.test(el.tagName) && styleUtils.hasScroll(el)) {
            point.x -= elementScroll.left;
            point.y -= elementScroll.top;
        }
        return positionUtils.offsetToClientCoords(point);
    }

    return point;
}

export function getEventOptionCoordinates (element, screenPoint) {
    var clientPoint = {
        x: screenPoint.x,
        y: screenPoint.y
    };

    if (domUtils.isElementInIframe(element)) {
        var currentIFrame = domUtils.getIframeByElement(element);
        if (currentIFrame) {
            var iFramePosition       = positionUtils.getOffsetPosition(currentIFrame),
                iFrameBorders        = styleUtils.getBordersWidth(currentIFrame),
                iframeClientPosition = positionUtils.offsetToClientCoords({
                    x: iFramePosition.left,
                    y: iFramePosition.top
                });

            clientPoint.x -= (iframeClientPosition.x + iFrameBorders.left);
            clientPoint.y -= (iframeClientPosition.y + iFrameBorders.top);
        }
    }

    return clientPoint;
}

export function focusAndSetSelection (element, options, needFocus, callback) {
    var activeElement         = domUtils.getActiveElement(),
        isTextEditable        = domUtils.isTextEditableElement(element),
        isContentEditable     = domUtils.isContentEditableElement(element),
        focusableElement      = isContentEditable ? contentEditable.findContentEditableParent(element) : element,
        contentEditableParent = null,
        needSelection         = isTextEditable || isContentEditable,
        labelWithForAttr      = domUtils.closest(element, 'label[for]');

    //NOTE: in WebKit if selection was never set in an input element, focus method selects all text of this element
    if (needFocus && browserUtils.isWebKit && isTextEditable)
        textSelection.select(element, 0, 0);
    //NOTE: we should call focus for input element after click on label with attribute 'for' (on recording)
    //T253883 - Playback - It is impossible to type a password
    if (labelWithForAttr && !domUtils.isElementFocusable(element)) {
        if (needFocus)
            focusElementByLabel(labelWithForAttr, callback);
        else
            callback();
    }
    else
        focusBlurSandbox.focus(focusableElement, function () {
            //NOTE: if some other element was focused in the focus event handler we should not set selection
            if (!isContentEditable && needFocus && element !== domUtils.getActiveElement()) {
                callback();
                return;
            }

            if (needSelection) {
                if (isContentEditable && isNaN(parseInt(options.caretPos)))
                    textSelection.setCursorToLastVisiblePosition(element);
                else {
                    var position = isNaN(parseInt(options.caretPos)) ? element.value.length : options.caretPos;
                    textSelection.select(element, position, position);
                }
            }
            else {
                //NOTE: if focus is called for not contentEditable element (like 'img' or 'button') inside contentEditable parent
                // we should try to set right window selection. Generally we can't set right window selection object because
                // after selection setup window.getSelection method returns  a different object depending on the browser.
                contentEditableParent = contentEditable.findContentEditableParent(focusableElement);
                if (contentEditableParent)
                    textSelection.setCursorToLastVisiblePosition(focusableElement);
            }
            //we can't avoid element focusing because set selection methods lead to focusing.
            // So we just focus previous active element without handlers if we don't need focus here
            if (!needFocus && activeElement !== domUtils.getActiveElement()) {
                focusBlurSandbox.focus(activeElement, callback, true, true);
            }
            else
                callback();
        }, !needFocus, true);
}

//NOTE: in all browsers after simulation of  click on label with attribute 'for' occurs focus event
// for related element, except Mozilla (so we should call focus)
export function focusLabelChildElement (element, callback) {
    var labelWithForAttr = domUtils.closest(element, 'label[for]');

    if (labelWithForAttr && !domUtils.isElementFocusable(element))
        focusElementByLabel(labelWithForAttr, callback);
    else if (callback)
        callback();
}

export function getDragEndPoint (startPosition, to, currentDocument) {
    var dragInIFrame = currentDocument !== document,
        pointTo      = {
            x: startPosition.x + Math.floor(to.dragOffsetX),
            y: startPosition.y + Math.floor(to.dragOffsetY)
        },
        maxX         = 0,
        maxY         = 0;

    if (dragInIFrame) {
        var currentIFrame = domUtils.getIframeByElement(currentDocument);
        if (currentIFrame) {
            var iFrameOffset  = positionUtils.getOffsetPosition(currentIFrame),
                iFrameBorders = styleUtils.getBordersWidth(currentIFrame);

            maxX = iFrameOffset.left + iFrameBorders.left;
            maxY = iFrameOffset.top + iFrameBorders.top;
        }
    }

    maxX += styleUtils.getWidth(currentDocument);
    maxY += styleUtils.getHeight(currentDocument);
    pointTo.x = pointTo.x < 0 ? 0 : pointTo.x;
    pointTo.x = pointTo.x > maxX ? maxX : pointTo.x;
    pointTo.y = pointTo.y < 0 ? 0 : pointTo.y;
    pointTo.y = pointTo.y > maxY ? maxY : pointTo.y;

    return pointTo;
}

export function getElementUnderCursor (x, y, currentDocument, target) {
    var topElement = cursor.getElementUnderCursor(x, y, currentDocument);

    if (!target || !domUtils.isDomElement(target) || topElement === target || !topElement)
        return topElement;

    //NOTE: T299665 - Incorrect click on image with associated map element in Mozilla
    if (browserUtils.isFirefox && target.tagName.toLowerCase() === 'area' &&
        topElement.tagName.toLowerCase() === 'img') {
        var mapElement = domUtils.closest(target, 'map');

        return mapElement && mapElement.name === topElement.useMap.substring(1) ? target : topElement;
    }

    if ((target.tagName.toLowerCase() !== 'a' && !domUtils.getParents(target, 'a').length) ||
        !target.textContent.length)
        return topElement;

    //NOTE: we caught link's child with text so it fit for redirect
    if (target.tagName.toLowerCase() === 'a' && domUtils.containsElement(target, topElement) &&
        topElement.textContent.length)
        return topElement;

    //NOTE: try to find myltiline link by her rectangle (T163678)
    var linkRect      = target.getBoundingClientRect();
    var curTopElement = cursor.getElementUnderCursor(linkRect.right - 1, linkRect.top + 1, currentDocument);

    if ((curTopElement && curTopElement === target) ||
        (domUtils.containsElement(target, curTopElement) && curTopElement.textContent.length))
        return curTopElement;
    else {
        curTopElement = cursor.getElementUnderCursor(linkRect.left + 1, linkRect.bottom - 1);

        if ((curTopElement && curTopElement === target) ||
            (domUtils.containsElement(target, curTopElement) && curTopElement.textContent.length))
            return curTopElement;
    }

    return topElement;
}
