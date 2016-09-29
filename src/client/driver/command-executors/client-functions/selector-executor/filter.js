import { InvalidSelectorResultError } from '../../../../../errors/test-run';
import { domUtils } from '../../../deps/testcafe-core';
import { getInnerText, getTextContent } from './sandboxed-node-properties';

// NOTE: save original ctors and methods because they may be overwritten by page code
var isArray        = Array.isArray;
var Node           = window.Node;
var HTMLCollection = window.HTMLCollection;
var NodeList       = window.NodeList;

function isArrayOfNodes (obj) {
    if (!isArray(obj))
        return false;

    for (var i = 0; i < obj.length; i++) {
        if (!(obj[i] instanceof Node))
            return false;
    }

    return true;
}

function hasText (node, textRe) {
    // Element
    if (node.nodeType === 1) {
        var text = getInnerText(node);

        // NOTE: In Firefox, <option> elements don't have `innerText`.
        // So, we fallback to `textContent` in that case (see GH-861).
        if (domUtils.isOptionElement(node)) {
            var textContent = getTextContent(node);

            if (!text && textContent)
                text = textContent;
        }

        return textRe.test(text);
    }

    // Document
    if (node.nodeType === 9) {
        // NOTE: latest version of Edge doesn't have `innerText` for `document`,
        // `html` and `body`. So we check their children instead.
        var head = node.querySelector('head');
        var body = node.querySelector('body');

        return hasChildrenWithText(head, textRe) || hasChildrenWithText(body, textRe);
    }

    // DocumentFragment
    if (node.nodeType === 11)
        return hasChildrenWithText(node, textRe);

    return textRe.test(getTextContent(node));
}

function hasChildrenWithText (node, textRe) {
    var cnCount = node.childNodes.length;

    for (var i = 0; i < cnCount; i++) {
        if (hasText(node.childNodes[i], textRe))
            return true;
    }

    return false;
}

function filterNodeCollectionByText (collection, textRe) {
    var count    = collection.length;
    var filtered = [];

    for (var i = 0; i < count; i++) {
        if (hasText(collection[i], textRe))
            filtered.push(collection[i]);
    }

    return filtered;
}


// Selector filter
Object.defineProperty(window, '%testCafeSelectorFilter%', {
    value: (node, options) => {
        if (node === null || node === void 0)
            return node;

        if (node instanceof Node) {
            if (options.text)
                return hasText(node, options.text) ? node : null;

            return node;
        }

        if (node instanceof HTMLCollection || node instanceof NodeList || isArrayOfNodes(node)) {
            if (options.text)
                node = filterNodeCollectionByText(node, options.text);

            return node[options.index];
        }

        throw new InvalidSelectorResultError();
    }
});
