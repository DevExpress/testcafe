import * as utils from './utils';

export default function ($) {
    $.expr[':'][utils.CONTAINS_OWN_TEXT_METHOD_NAME] = function (obj, index, meta) {
        /* obj - is a current DOM element
         index - the current loop index in stack
         meta - meta data about your selector where meta[3] is argument
         stack - stack of all elements to loop

         Return true to include current element
         Return false to explude current element
         */
        return utils.containsExcludeChildrenPredicate(obj, meta[3]);
    };

    $.expr[':'][utils.ATTR_REGEXP_METHOD_NAME] = function (obj, index, meta) {
        return utils.attrRegExpPredicate(obj, meta[3]);
    };
}
