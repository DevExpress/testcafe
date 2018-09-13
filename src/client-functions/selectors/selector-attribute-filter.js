// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

/* eslint-disable no-undef */
export default function selectorAttributeFilter (node, index, originNode, attrName, attrValue) {
    if (node.nodeType !== 1)
        return false;

    const attributes = node.attributes;
    let attr       = null;

    const check = (actual, expect) => typeof expect === 'string' ? expect === actual : expect.test(actual);

    for (let i = 0; i < attributes.length; i++) {
        attr = attributes[i];

        if (check(attr.nodeName, attrName) && (!attrValue || check(attr.nodeValue, attrValue)))
            return true;
    }

    return false;
}
/* eslint-enable no-undef */
