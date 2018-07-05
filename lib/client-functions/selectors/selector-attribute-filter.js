'use strict';

exports.__esModule = true;
exports.default = selectorAttributeFilter;
// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

/* eslint-disable no-undef */
function selectorAttributeFilter(node, index, originNode, attrName, attrValue) {
    if (node.nodeType !== 1) return false;

    var attributes = node.attributes;
    var attr = null;

    var check = function check(actual, expect) {
        return typeof expect === 'string' ? expect === actual : expect.test(actual);
    };

    for (var i = 0; i < attributes.length; i++) {
        attr = attributes[i];

        if (check(attr.nodeName, attrName) && (!attrValue || check(attr.nodeValue, attrValue))) return true;
    }

    return false;
}
/* eslint-enable no-undef */

module.exports = exports['default'];