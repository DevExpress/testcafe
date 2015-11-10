import { Parser } from 'parse5';
import TEMPLATES from './templates';

function getSelector (node) {
    var dataTypeAttr = node.attrs.filter(attr => attr.name === 'data-type')[0];
    var type         = dataTypeAttr && dataTypeAttr.value || '';

    return type ? `${node.tagName} ${type}` : node.tagName;
}

function decorateHTML (node, decorator) {
    var msg = '';

    if (node.nodeName === '#text')
        msg = node.value;
    else {
        if (node.childNodes.length)
            msg = node.childNodes.reduce((prev, childNode) => prev + decorateHTML(childNode, decorator), msg);

        if (node.nodeName !== '#document-fragment')
            msg = decorator[getSelector(node)](msg, node.attrs);
    }

    return msg;
}

export default function format (err, decorator, viewportWidth) {
    var parser   = new Parser();
    var fragment = parser.parseFragment(TEMPLATES[err.type](err, viewportWidth));

    return decorateHTML(fragment, decorator);
}
