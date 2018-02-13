// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

/* eslint-disable no-undef */
export default function selectorTextFilter (node, index, originNode, textFilter) {

    function hasChildrenWithText (parentNode) {
        var cnCount = parentNode.childNodes.length;

        for (var i = 0; i < cnCount; i++) {
            if (selectorTextFilter(parentNode.childNodes[i], index, originNode, textFilter))
                return true;
        }

        return false;
    }

    function checkNodeText (text) {
        if (textFilter instanceof RegExp)
            return textFilter.test(text);
        return textFilter === text.trim();
    }

    // Element
    if (node.nodeType === 1) {
        var text = node.innerText;

        // NOTE: In Firefox, <option> elements don't have `innerText`.
        // So, we fallback to `textContent` in that case (see GH-861).
        if (node.tagName.toLowerCase() === 'option') {
            var textContent = node.textContent;

            if (!text && textContent)
                text = textContent;
        }

        return checkNodeText(text);
    }

    // Document
    if (node.nodeType === 9) {
        // NOTE: latest version of Edge doesn't have `innerText` for `document`,
        // `html` and `body`. So we check their children instead.
        var head = node.querySelector('head');
        var body = node.querySelector('body');

        return hasChildrenWithText(head, textFilter) || hasChildrenWithText(body, textFilter);
    }

    // DocumentFragment
    if (node.nodeType === 11)
        return hasChildrenWithText(node, textFilter);

    return checkNodeText(node.textContent);
}
/* eslint-enable no-undef */
