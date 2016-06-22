import { processScript, PROCESSING_COMMENTS } from '../../deps/hammerhead';
import { positionUtils } from '../../deps/testcafe-core';
import evalFunction from './eval-function';

// NOTE: taken from https://github.com/benjamingr/RegExp.escape
function escapeRe (str) {
    return str.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

const SCRIPT_RE     = new RegExp(`${escapeRe(PROCESSING_COMMENTS.scriptStart)}.*?${escapeRe(PROCESSING_COMMENTS.scriptEnd)}`, 'g');
const STYLESHEET_RE = new RegExp(`${escapeRe(PROCESSING_COMMENTS.stylesheetStart)}.*?${escapeRe(PROCESSING_COMMENTS.stylesheetEnd)}`, 'g');

function sandboxed (fn) {
    var code = `(${fn.toString()})`;

    code = processScript(code, false);

    return evalFunction(code, null);
}

var getAttrs       = sandboxed(element => element.attributes);
var getChildNodes  = sandboxed(node => node.childNodes);
var getChildren    = sandboxed(node => node.children);
var getTextContent = sandboxed(node => node.textContent);
var getClassName   = sandboxed(element => element.className);
var getInnerText   = sandboxed(element => element.innerText);

export class NodeSnapshot {
    constructor (node) {
        this.nodeType    = node.nodeType;
        this.textContent = getTextContent(node);

        this.childNodeCount = getChildNodes(node).length;
        this.hasChildNodes  = !!this.childNodeCount;

        this.childElementCount = NodeSnapshot._getChildElementCount(node);
        this.hasChildElements  = !!this.childElementCount;
    }

    static _getChildElementCount (node) {
        var children = getChildren(node);

        if (children)
            return children.length;

        // NOTE: IE doesn't have `children` for non-element nodes =/
        var childElementCount = 0;
        var childNodeCount    = node.childNodes.length;

        for (var i = 0; i < childNodeCount; i++) {
            if (node.childNodes[i].nodeType === 1)
                childElementCount++;
        }

        return childElementCount;
    }
}

export class ElementSnapshot extends NodeSnapshot {
    constructor (element) {
        super(element);

        this.tagName            = element.tagName.toLowerCase();
        this.visible            = positionUtils.isElementVisible(element);
        this.focused            = document.activeElement === element;
        this.attributes         = ElementSnapshot._getAttrsDictionary(element);
        this.boundingClientRect = ElementSnapshot._getBoundingClientRect(element);
        this.classNames         = ElementSnapshot._getClassNames(element);
        this.style              = ElementSnapshot._getStyle(element);
        this.innerText          = ElementSnapshot._getInnerText(element);

        [
            'namespaceURI', 'id',
            'value', 'checked',
            'scrollWidth', 'scrollHeight', 'scrollLeft', 'scrollTop',
            'offsetWidth', 'offsetHeight', 'offsetLeft', 'offsetTop',
            'clientWidth', 'clientHeight', 'clientLeft', 'clientTop'
        ].forEach(prop => this[prop] = element[prop]);
    }

    static _getBoundingClientRect (element) {
        var rect = element.getBoundingClientRect();

        return {
            left:   rect.left,
            right:  rect.right,
            top:    rect.top,
            bottom: rect.bottom,
            width:  rect.width,
            height: rect.height
        };
    }

    static _getClassNames (element) {
        var className = getClassName(element);

        className = typeof className.animVal === 'string' ? className.animVal : className;

        return className
            .replace(/^\s+|\s+$/g, '')
            .split(/\s+/g);
    }

    static _getAttrsDictionary (element) {
        var attrs  = getAttrs(element);
        var result = {};

        for (var i = attrs.length - 1; i >= 0; i--)
            result[attrs[i].name] = attrs[i].value;

        return result;
    }

    static _getStyle (element) {
        var result   = {};
        var computed = window.getComputedStyle(element);

        for (var i = 0; i < computed.length; i++) {
            var prop = computed[i];

            result[prop] = computed[prop];
        }

        return result;
    }

    static _getInnerText (element) {
        var innerText = getInnerText(element);

        // NOTE: IE includes scripts and stylesheets in innerText
        return innerText && innerText
                .replace(SCRIPT_RE, '')
                .replace(STYLESHEET_RE, '')
                .replace(/\r\n/g, '\n');
    }
}
