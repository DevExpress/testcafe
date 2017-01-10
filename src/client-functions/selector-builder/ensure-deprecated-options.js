import showDeprecatedMessage from '../../notifications/deprecated-message';
import getCallsite from '../../errors/get-callsite';

export default function ensureDeprecatedOptions (callsiteName, options) {
    if (options && (options.text || options.index || options.dependencies)) {
        var callsite = getCallsite(callsiteName);

        if (options.text) {
            showDeprecatedMessage(callsite, {
                what:       'selectorOptions.text',
                useInstead: 'selector.withText()'
            });
        }

        if (options.index) {
            showDeprecatedMessage(callsite, {
                what:       'selectorOptions.index',
                useInstead: 'selector.nth()'
            });
        }

        if (options.dependencies) {
            showDeprecatedMessage(callsite, {
                what:       'selectorOptions.dependencies',
                useInstead: 'hierarchical selectors (e.g. selector.find())'
            });
        }
    }
}
