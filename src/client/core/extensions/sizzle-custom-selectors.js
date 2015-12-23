import Sizzle from '../sandboxed-sizzle';
import * as utils from './utils';

export default function () {
    Sizzle.selectors.pseudos[utils.CONTAINS_OWN_TEXT_METHOD_NAME] = Sizzle.selectors.createPseudo(selector => function (el) {
        return utils.containsExcludeChildrenPredicate(el, selector);
    });

    Sizzle.selectors.pseudos[utils.ATTR_REGEXP_METHOD_NAME] = Sizzle.selectors.createPseudo(selector => function (el) {
        return utils.attrRegExpPredicate(el, selector);
    });
}

