import showDeprecationMessage from '../../notifications/deprecation-message';
import getCallsite from '../../errors/get-callsite';

export default function ensureDeprecatedOptions (callsiteName, options) {
    if (options && (options.text || options.index || options.dependencies)) {
        var callsite = getCallsite(callsiteName);

        if (options.text) {
            showDeprecationMessage(callsite, {
                what:       'selectorOptions.text',
                useInstead: 'selector.withText()'
            });
        }

        if (options.index) {
            showDeprecationMessage(callsite, {
                what:       'selectorOptions.index',
                useInstead: 'selector.nth()'
            });
        }

        if (options.dependencies) {
            showDeprecationMessage(callsite, {
                what:       'selectorOptions.dependencies',
                useInstead: 'hierarchical selectors (e.g. selector.find())'
            });
        }
    }
}
