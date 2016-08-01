import { processScript, PROCESSING_COMMENTS } from '../../../deps/hammerhead';
import evalFunction from '../eval-function';

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

export var getAttrs       = sandboxed(element => element.attributes);
export var getChildNodes  = sandboxed(node => node.childNodes);
export var getChildren    = sandboxed(node => node.children);
export var getTextContent = sandboxed(node => node.textContent);
export var getClassName   = sandboxed(element => element.className);

var getSandboxedInnerText = sandboxed(element => element.innerText);

export function getInnerText (element) {
    var innerText = getSandboxedInnerText(element);

    // NOTE: IE includes scripts and stylesheets in innerText
    return innerText && innerText
        .replace(SCRIPT_RE, '')
        .replace(STYLESHEET_RE, '')
        .replace(/\r\n/g, '\n');
}
