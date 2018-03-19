import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

var Promise          = hammerhead.Promise;
var nativeMethods    = hammerhead.nativeMethods;
var browserUtils     = hammerhead.utils.browser;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

var contentEditable = testCafeCore.contentEditable;
var textSelection   = testCafeCore.textSelection;
var domUtils        = testCafeCore.domUtils;


function setCaretPosition (element, caretPos) {
    var isTextEditable    = domUtils.isTextEditableElement(element);
    var isContentEditable = domUtils.isContentEditableElement(element);

    if (isTextEditable || isContentEditable) {
        if (isContentEditable && isNaN(parseInt(caretPos, 10)))
            textSelection.setCursorToLastVisiblePosition(element);
        else {
            var position = isNaN(parseInt(caretPos, 10)) ? domUtils.getElementValue(element).length : caretPos;

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
        var isElementFocusable          = domUtils.isElementFocusable(element);
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

            resolve();
            return;
        }

        var focusWithSilentMode = !simulateFocus;
        var focusForMouseEvent  = true;
        var preventScrolling    = false;

        if (!isElementFocusable && !isContentEditable) {
            var curDocument         = domUtils.findDocument(elementForFocus);
            var curActiveElement    = nativeMethods.documentActiveElementGetter.call(curDocument);
            var isActiveElementBody = domUtils.isBodyElement(curActiveElement);
            var focusableParent     = domUtils.isBodyElement(elementForFocus) ?
                elementForFocus : domUtils.getFocusableParent(elementForFocus);

            // NOTE: we should not call focus or blur if action element is
            // not focusable and is child of active element (gh-889)
            var elementChildOfActiveElement = curActiveElement && !isActiveElementBody &&
                                              domUtils.containsElement(curActiveElement, elementForFocus);

            if (elementChildOfActiveElement || isActiveElementBody && domUtils.isBodyElement(focusableParent)) {
                resolve();
                return;
            }

            elementForFocus  = focusableParent || curDocument.body;
            preventScrolling = true;
        }

        focusBlurSandbox.focus(elementForFocus, () => {
            // NOTE: if a different element was focused in the focus event handler, we should not set selection
            if (simulateFocus && !isContentEditable && element !== domUtils.getActiveElement()) {
                resolve();
                return;
            }

            setCaretPosition(element, caretPos);

            // NOTE: we can't avoid the element being focused because the setSelection method leads to focusing.
            // So, we just focus the previous active element without handlers if we don't need focus here
            if (!simulateFocus && domUtils.getActiveElement() !== activeElement)
                focusBlurSandbox.focus(activeElement, resolve, true, true);
            else
                resolve();
        }, focusWithSilentMode, focusForMouseEvent, false, preventScrolling);
    });
}

export function focusByRelatedElement (element) {
    var labelWithForAttr = domUtils.closest(element, 'label[for]');

    if (!labelWithForAttr)
        return;

    var elementForFocus = document.getElementById(labelWithForAttr.getAttribute('for'));

    if (!elementForFocus || domUtils.getActiveElement() === elementForFocus)
        return;

    focusBlurSandbox.focus(elementForFocus, testCafeCore.noop, false, true);
}
