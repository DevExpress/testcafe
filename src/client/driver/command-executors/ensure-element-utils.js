import { nativeMethods } from '../deps/hammerhead';
import { waitFor, positionUtils, domUtils, contentEditable } from '../deps/testcafe-core';
import {
    ActionElementNonEditableError,
    ActionElementNonContentEditableError,
    ActionRootContainerNotFoundError,
    ActionElementNotTextAreaError
} from '../../../errors/test-run';


const CHECK_ELEMENT_DELAY = 200;


function ensureElementExists (selector, timeout, createError) {
    return waitFor(selector, CHECK_ELEMENT_DELAY, timeout)
        .catch(() => {
            throw createError();
        });
}

function ensureElementVisible (element, timeout, createError) {
    return waitFor(() => positionUtils.isElementVisible(element) ? element : null, CHECK_ELEMENT_DELAY, timeout)
        .catch(() => {
            throw createError();
        });
}

export function ensureElementEditable (element) {
    if (!domUtils.isEditableElement(element))
        throw new ActionElementNonEditableError();
}

export function ensureTextAreaElement (element) {
    if (!domUtils.isTextAreaElement(element))
        throw new ActionElementNotTextAreaError();
}

export function ensureContentEditableElement (element, argumentTitle) {
    if (!domUtils.isContentEditableElement(element))
        throw new ActionElementNonContentEditableError(argumentTitle);
}

export function ensureRootContainer (elements) {
    // NOTE: We should find a common element for the nodes to perform the select action
    if (!contentEditable.getNearestCommonAncestor(elements[0], elements[1]))
        throw new ActionRootContainerNotFoundError();

    return elements;
}

export function ensureElement (selector, timeout, createNotFoundError, createIsInvisibleError) {
    var startTime = new Date();

    return ensureElementExists(() => nativeMethods.eval.call(window, selector), timeout, createNotFoundError)
        .then(element => {
            var checkVisibilityTimeout = timeout - (new Date() - startTime);

            return ensureElementVisible(element, checkVisibilityTimeout, createIsInvisibleError);
        });
}
