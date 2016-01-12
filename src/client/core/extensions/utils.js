import hammerhead from '../deps/hammerhead';


export const CONTAINS_OWN_TEXT_METHOD_NAME = 'containsExcludeChildren';
export const ATTR_REGEXP_METHOD_NAME       = 'attrRegExp';

const TEXT_ELEMENT_TAGS_RE = /^i$|^b$|^big$|^small$|^em$|^strong$|^dfn$|^code$|^samp$|^kbd$|^var$|^cite$|^abbr$|^acronym$|^sub$|^sup$|span$|^bdo$|^address$|^div$|^a$|^object$|^p$|^h\d$|^pre$|^q$|^ins$|^del$|^dt$|^dd$|^li$|^label$|^option$|^textarea$|^fieldset$|^legend$|^button$|^caption$|^td$|^th$|^title$/;
const START_SUBSTR_RE      = ':/';
const END_SUBSTR_RE        = '/';

function getOwnTextForSelector (element) {
    if (!element || !TEXT_ELEMENT_TAGS_RE.test(element.tagName.toLowerCase()))
        return '';

    var text = '';

    for (var i = 0; i < element.childNodes.length; i++) {
        if (element.childNodes[i].nodeType === 3 && element.childNodes[i].data)
            text += element.childNodes[i].data;
    }

    if (text) {
        //\xC0-\xFF - latin letters
        text = hammerhead.utils.trim(text.replace(/[^a-z0-9а-я \xC0-\xFF]+/gi, ''));
        text = text.replace(/\s+/g, ' ');
        if (/\S/.test(text))
            return text;
    }

    return '';
}

export function containsExcludeChildrenPredicate (el, selector) {
    if (!selector)
        return false;

    var textExcludeChildren = getOwnTextForSelector(el);

    return textExcludeChildren && textExcludeChildren.indexOf(selector) >= 0;
}

export function attrRegExpPredicate (el, selector) {
    if (!selector)
        return false;

    var startSubstrReLength       = START_SUBSTR_RE.length;
    var endSubstrReLength         = END_SUBSTR_RE.length;
    var containsRegExpStartSubstr = selector.indexOf(START_SUBSTR_RE) > 0;
    var endsWithRegExpEndSubstr   = selector.lastIndexOf(END_SUBSTR_RE) ===
                                    selector.length - endSubstrReLength;
    var notEmptyRegExpValue       = selector.indexOf(START_SUBSTR_RE) <
                                    selector.length - endSubstrReLength -
                                    startSubstrReLength;

    if (containsRegExpStartSubstr && endsWithRegExpEndSubstr && notEmptyRegExpValue) {
        var regExpStartSubstringIndex = selector.indexOf(START_SUBSTR_RE);
        var attrName                  = selector.substr(0, regExpStartSubstringIndex);
        var regExpString              = selector.substring(regExpStartSubstringIndex + startSubstrReLength,
            selector.lastIndexOf(END_SUBSTR_RE));

        return new RegExp(regExpString).test(el.getAttribute(attrName));
    }
    else
        return false;
}
