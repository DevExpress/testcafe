import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

var noop             = () => {};

var Promise          = hammerhead.Promise;
var browserUtils     = hammerhead.utils.browser;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var contentEditable = testCafeCore.contentEditable;
var textSelection   = testCafeCore.textSelection;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var styleUtils      = testCafeCore.styleUtils;


function setCaretPosition (element, caretPos) {
    var isTextEditable    = domUtils.isTextEditableElement(element);
    var isContentEditable = domUtils.isContentEditableElement(element);

    if (isTextEditable || isContentEditable) {
        if (isContentEditable && isNaN(parseInt(caretPos, 10)))
            textSelection.setCursorToLastVisiblePosition(element);
        else {
            var position = isNaN(parseInt(caretPos, 10)) ? element.value.length : caretPos;

            textSelection.select(element, position, position);
        }
    }
    else {
        // NOTE: if focus is called for a non-contentEditable element (like 'img' or 'button') inside
        // a contentEditable parent, we should try to set the right window selection. Generally, we can't
        // set the right window selection object because after the selection setup, the window.getSelection
        // method returns a different object, which depends on the browser.
        var contentEditableParent = contentEditable.findContentEditableParent(element);

        if (contentEditableParent)
            textSelection.setCursorToLastVisiblePosition(contentEditable.findContentEditableParent(contentEditableParent));
    }
}

export function focusAndSetSelection (element, simulateFocus, caretPos) {
    return new Promise(resolve => {
        var activeElement               = domUtils.getActiveElement();
        var isTextEditable              = domUtils.isTextEditableElement(element);
        var labelWithForAttr            = domUtils.closest(element, 'label[for]');
        var shouldFocusByRelatedElement = !domUtils.isElementFocusable(element) && labelWithForAttr;
        var isContentEditable           = domUtils.isContentEditableElement(element);
        var elementForFocus             = isContentEditable ? contentEditable.findContentEditableParent(element) : element;

        // NOTE: in WebKit, if selection was never set in an input element, the focus method selects all the
        // text in this element. So, we should call select before focus to set the caret to the first symbol.
        if (simulateFocus && browserUtils.isWebKit && isTextEditable)
            textSelection.select(element, 0, 0);

        // NOTE: we should call focus for the element related with a 'label' that has the 'for' attribute
        if (shouldFocusByRelatedElement) {
            if (simulateFocus)
                focusByRelatedElement(labelWithForAttr);

            return resolve();
        }

        var focusWithSilentMode = !simulateFocus;
        var focusForMouseEvent  = true;

        focusBlurSandbox.focus(elementForFocus, () => {
            // NOTE: if a different element was focused in the focus event handler, we should not set selection
            if (simulateFocus && !isContentEditable && element !== domUtils.getActiveElement())
                return resolve();

            setCaretPosition(element, caretPos);

            // NOTE: we can't avoid the element being focused because the setSelection method leads to focusing.
            // So, we just focus the previous active element without handlers if we don't need focus here
            if (!simulateFocus && domUtils.getActiveElement() !== activeElement)
                return focusBlurSandbox.focus(activeElement, resolve, true, true);

            resolve();
        }, focusWithSilentMode, focusForMouseEvent);
    });
}

export function focusByRelatedElement (element) {
    var labelWithForAttr = domUtils.closest(element, 'label[for]');

    if (!labelWithForAttr)
        return;

    var elementForFocus = document.getElementById(labelWithForAttr.getAttribute('for'));

    if (!elementForFocus || domUtils.getActiveElement() === elementForFocus)
        return;

    focusBlurSandbox.focus(elementForFocus, noop, false, true);
}

//TODO: all methods below will be moved from this file
export function getMouseActionPoint (el, actionOptions, convertToScreen) {
    var elementOffset = positionUtils.getOffsetPosition(el);
    var left          = el === document.documentElement ? 0 : elementOffset.left;
    var top           = el === document.documentElement ? 0 : elementOffset.top;
    var elementScroll = styleUtils.getElementScroll(el);
    var point         = positionUtils.findCenter(el);

    if (actionOptions && typeof actionOptions.offsetX !== 'undefined' && !isNaN(parseInt(actionOptions.offsetX, 10)))
        point.x = left + (actionOptions.offsetX || 0);

    if (actionOptions && typeof actionOptions.offsetY !== 'undefined' && !isNaN(parseInt(actionOptions.offsetY, 10)))
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
        var currentIframe = domUtils.getIframeByElement(element);

        if (currentIframe) {
            var iframePosition       = positionUtils.getOffsetPosition(currentIframe);
            var iframeBorders        = styleUtils.getBordersWidth(currentIframe);
            var iframeClientPosition = positionUtils.offsetToClientCoords({
                x: iframePosition.left,
                y: iframePosition.top
            });

            clientPoint.x -= iframeClientPosition.x + iframeBorders.left;
            clientPoint.y -= iframeClientPosition.y + iframeBorders.top;
        }
    }

    return clientPoint;
}

export function getDefaultAutomationOffsets (element) {
    var elementCenter = positionUtils.getElementCenter(element);

    return {
        offsetX: elementCenter.x,
        offsetY: elementCenter.y
    };
}
