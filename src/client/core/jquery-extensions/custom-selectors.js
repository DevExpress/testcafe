import $ from '../deps/jquery';

export var REGEXP_START_SUBSTR           = ':/';
export var REGEXP_END_SUBSTR             = '/';
export var ATTR_REGEXP_METHOD_NAME       = 'attrRegExp';
export var CONTAINS_OWN_TEXT_METHOD_NAME = 'containsExcludeChildren';

export var init                  = null;
export var getOwnTextForSelector = null;

export function create ($) {
    var textElementTagsRegExp = /^i$|^b$|^big$|^small$|^em$|^strong$|^dfn$|^code$|^samp$|^kbd$|^var$|^cite$|^abbr$|^acronym$|^sub$|^sup$|span$|^bdo$|^address$|^div$|^a$|^object$|^p$|^h\d$|^pre$|^q$|^ins$|^del$|^dt$|^dd$|^li$|^label$|^option$|^textarea$|^fieldset$|^legend$|^button$|^caption$|^td$|^th$|^title$/;

    init = function () {
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
            var argument = meta[3],
                attrName,
                regExpString;
            if (!argument)
                return false;
            if (argument.indexOf(REGEXP_START_SUBSTR) > 0 &&
                argument.lastIndexOf(REGEXP_END_SUBSTR) === argument.length - REGEXP_END_SUBSTR.length &&
                argument.indexOf(REGEXP_START_SUBSTR) <
                argument.length - REGEXP_END_SUBSTR.length - REGEXP_START_SUBSTR.length) {
                attrName     = argument.substr(0, argument.indexOf(REGEXP_START_SUBSTR));
                regExpString = argument.substring(argument.indexOf(REGEXP_START_SUBSTR) +
                                                  REGEXP_START_SUBSTR.length, argument.lastIndexOf(REGEXP_END_SUBSTR));
                return new RegExp(regExpString).test(obj.getAttribute(attrName));
            }
            else return false;
        };
    };

    getOwnTextForSelector = function (element) {
        if (!element || !textElementTagsRegExp.test(element.tagName.toLowerCase()))
            return '';

        var text = '';

        for (var i = 0; i < element.childNodes.length; i++) {
            if (element.childNodes[i].nodeType === 3 && element.childNodes[i].data)
                text += element.childNodes[i].data;
        }

        if (text) {
            //\xC0-\xFF - latin letters
            text = $.trim(text.replace(/[^a-z0-9а-я \xC0-\xFF]+/gi, ''));
            text = text.replace(/\s+/g, ' ');
            if (/\S/.test(text))
                return text;
        }

        return '';
    };

    return $;
}

create($);
