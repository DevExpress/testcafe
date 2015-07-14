/*
 Module Dependencies
 */
var parse5 = require('parse5');

var parser = new parse5.Parser(parse5.TreeAdapters.htmlparser2);

/*
 Parser
 */
exports = module.exports = function (content, options, isDocument) {
    var dom = exports.evaluate(content, options, isDocument);

    // Generic root element
    var root = parse5.TreeAdapters.htmlparser2.createDocument();

    // Update the dom using the root
    exports.update(dom, root);

    return root;
};

var shouldParseAsDocument = function (content) {
    //NOTE: if evaluate was called in fragment parsing mode, but doctype or <html> tag was passed
    //we should switch to document parsing mode. This is a pretty simple heuristic, e.g. we don't expect
    //comments at the beginning of the content.
    return /^\s*<!doctype/i.test(content) || /^\s*<html/i.test(content);
};

exports.evaluate = function (content, options, isDocument) {
    var dom = null;

    if (Buffer.isBuffer(content))
        content = content.toString();

    if (typeof content === 'string') {

        if (isDocument || shouldParseAsDocument(content))
            dom = parser.parse(content);
        else
            dom = parser.parseFragment(content);

        dom = dom.children;

        return dom;
    }

    return content;
};

/*
 Update the dom structure, for one changed layer
 */
exports.update = function (arr, parent) {
    // normalize
    if (!Array.isArray(arr)) arr = [arr];

    // Update parent
    if (parent) {
        parent.children = arr;
    } else {
        parent = null;
    }

    // Update neighbors
    for (var i = 0; i < arr.length; i++) {
        var node = arr[i];

        // Cleanly remove existing nodes from their previous structures.
        var oldParent = node.parent || node.root,
            oldSiblings = oldParent && oldParent.children;
        if (oldSiblings && oldSiblings !== arr) {
            oldSiblings.splice(oldSiblings.indexOf(node), 1);
            if (node.prev) {
                node.prev.next = node.next;
            }
            if (node.next) {
                node.next.prev = node.prev;
            }
        }

        if (parent) {
            node.prev = arr[i - 1] || null;
            node.next = arr[i + 1] || null;
        } else {
            node.prev = node.next = null;
        }

        if (parent && parent.type === 'root') {
            node.root = parent;
            node.parent = null;
        } else {
            node.root = null;
            node.parent = parent;
        }
    }

    return parent;
};

// module.exports = $.extend(exports);
