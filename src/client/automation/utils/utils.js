import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';

const Promise          = hammerhead.Promise;
const nativeMethods    = hammerhead.nativeMethods;
const browserUtils     = hammerhead.utils.browser;
const focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

const contentEditable = testCafeCore.contentEditable;
const textSelection   = testCafeCore.textSelection;
const domUtils        = testCafeCore.domUtils;
const styleUtils      = testCafeCore.styleUtils;


function setCaretPosition (element, caretPos) {
    const isTextEditable    = domUtils.isTextEditableElement(element);
    const isContentEditable = domUtils.isContentEditableElement(element);

    if (isTextEditable || isContentEditable) {
        if (isContentEditable && isNaN(parseInt(caretPos, 10)))
            textSelection.setCursorToLastVisiblePosition(element);
        else {
            const position = isNaN(parseInt(caretPos, 10)) ? domUtils.getElementValue(element).length : caretPos;

            textSelection.select(element, position, position);
        }
    }
    else {
        // NOTE: if focus is called for a non-contentEditable element (like 'img' or 'button') inside
        // a contentEditable parent, we should try to set the right window selection. Generally, we can't
        // set the right window selection object because after the selection setup, the window.getSelection
        // method returns a different object, which depends on the browser.
        const contentEditableParent = contentEditable.findContentEditableParent(element);

        if (contentEditableParent)
            textSelection.setCursorToLastVisiblePosition(contentEditable.findContentEditableParent(contentEditableParent));
    }
}

export function focusAndSetSelection (element, simulateFocus, caretPos) {
    return new Promise(resolve => {
        const activeElement               = domUtils.getActiveElement();
        const isTextEditable              = domUtils.isTextEditableElement(element);
        const labelWithForAttr            = domUtils.closest(element, 'label[for]');
        const isElementFocusable          = domUtils.isElementFocusable(element);
        const shouldFocusByRelatedElement = labelWithForAttr;
        const isContentEditable           = domUtils.isContentEditableElement(element);
        let elementForFocus               = isContentEditable ? contentEditable.findContentEditableParent(element) : element;

        // NOTE: in WebKit, if selection was never set in an input element, the focus method selects all the
        // text in this element. So, we should call select before focus to set the caret to the first symbol.
        if (simulateFocus && browserUtils.isWebKit && isTextEditable)
            textSelection.select(element, 0, 0);

        // NOTE: we should call focus for the element related with a 'label' that has the 'for' attribute
        if (shouldFocusByRelatedElement) {
            if (simulateFocus)
                focusByLabel(labelWithForAttr);

            resolve();
            return;
        }

        const focusWithSilentMode = !simulateFocus;
        const focusForMouseEvent  = true;
        let preventScrolling      = false;

        if (!isElementFocusable && !isContentEditable) {
            const curDocument         = domUtils.findDocument(elementForFocus);
            const curActiveElement    = nativeMethods.documentActiveElementGetter.call(curDocument);
            const isActiveElementBody = domUtils.isBodyElement(curActiveElement);
            const focusableParent     = domUtils.isBodyElement(elementForFocus) ?
                elementForFocus : domUtils.getFocusableParent(elementForFocus);

            // NOTE: we should not call focus or blur if action element is
            // not focusable and is child of active element (gh-889)
            const elementChildOfActiveElement = curActiveElement && !isActiveElementBody &&
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

export function getElementBoundToLabel (element) {
    const labelWithForAttr = domUtils.closest(element, 'label[for]');
    const control          = labelWithForAttr && (labelWithForAttr.control || document.getElementById(labelWithForAttr.htmlFor));
    const isControlVisible = control && styleUtils.isElementVisible(control);

    return isControlVisible ? control : null;
}

export function focusByLabel (label) {
    if (domUtils.isElementFocusable(label))
        focusBlurSandbox.focus(label, testCafeCore.noop, false, true);
    else
        focusByRelatedElement(label);
}

export function focusByRelatedElement (element) {
    const elementForFocus = getElementBoundToLabel(element);

    if (!elementForFocus || domUtils.getActiveElement() === elementForFocus)
        return;

    focusBlurSandbox.focus(elementForFocus, testCafeCore.noop, false, true);
}
