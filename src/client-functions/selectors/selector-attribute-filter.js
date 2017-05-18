// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

/* eslint-disable no-undef */
export default function selectorAttributeFilter (node, index, originNode, attrNameRe, attrValueRe) {
    if (node.nodeType !== 1)
        return false;

    var attributes = node.attributes;
    var attr       = null;

    for (var i = 0; i < attributes.length; i++) {
        attr = attributes[i];

        if (attrNameRe.test(attr.nodeName) && (!attrValueRe || attrValueRe.test(attr.nodeValue)))
            return true;
    }

    return false;
}
/* eslint-enable no-undef */
