import hammerhead from '../deps/hammerhead';
import { domUtils } from '../deps/testcafe-core';

var isTextNode = domUtils.isTextNode;
var getTagName = domUtils.getTagName;

const START_SUBSTR_RE               = ':/';
const END_SUBSTR_RE                 = '/';
const START_SUBSTR_RE_LENGTH        = START_SUBSTR_RE.length;
const END_SUBSTR_RE_LENGTH          = END_SUBSTR_RE.length;
const ATTR_REGEXP_METHOD_NAME       = 'attrRegExp';
const CONTAINS_OWN_TEXT_METHOD_NAME = 'containsExcludeChildren';
const TEXT_ELEMENT_TAGS_RE          = /^i$|^b$|^big$|^small$|^em$|^strong$|^dfn$|^code$|^samp$|^kbd$|^var$|^cite$|^abbr$|^acronym$|^sub$|^sup$|span$|^bdo$|^address$|^div$|^a$|^object$|^p$|^h\d$|^pre$|^q$|^ins$|^del$|^dt$|^dd$|^li$|^label$|^option$|^textarea$|^fieldset$|^legend$|^button$|^caption$|^td$|^th$|^title$/;

function getOwnTextForSelector (element) {
    if (!element || !TEXT_ELEMENT_TAGS_RE.test(getTagName(element)))
        return '';

    var text = '';

    for (var i = 0; i < element.childNodes.length; i++) {
        if (isTextNode(element.childNodes[i]) && element.childNodes[i].data)
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

export default function ($) {
    $.expr[':'][CONTAINS_OWN_TEXT_METHOD_NAME] = function (obj, index, meta) {
        /* obj - is a current DOM element
         index - the current loop index in stack
         meta - meta data about your selector where meta[3] is argument
         stack - stack of all elements to loop

         Return true to include current element
         Return false to explude current element
         */
        if (!meta[3])
            return false;

        var textExcludeChildren = getOwnTextForSelector(obj);

        return !!(textExcludeChildren && textExcludeChildren.indexOf(meta[3]) >= 0);
    };

    $.expr[':'][ATTR_REGEXP_METHOD_NAME] = function (obj, index, meta) {
        var selector = meta[3];

        if (!selector)
            return false;

        var containsRegExpStartSubstr = selector.indexOf(START_SUBSTR_RE) > 0;
        var endsWithRegExpEndSubstr   = selector.lastIndexOf(END_SUBSTR_RE) === selector.length - END_SUBSTR_RE_LENGTH;
        var notEmptyRegExpValue       = selector.indexOf(START_SUBSTR_RE) <
                                        selector.length - END_SUBSTR_RE_LENGTH - START_SUBSTR_RE_LENGTH;

        if (containsRegExpStartSubstr && endsWithRegExpEndSubstr && notEmptyRegExpValue) {
            var regExpStartSubstringIndex = selector.indexOf(START_SUBSTR_RE);
            var attrName                  = selector.substr(0, regExpStartSubstringIndex);
            var regExpString              = selector.substring(regExpStartSubstringIndex + START_SUBSTR_RE_LENGTH,
                selector.lastIndexOf(END_SUBSTR_RE));

            return new RegExp(regExpString).test(obj.getAttribute(attrName));
        }

        return false;
    };
}
