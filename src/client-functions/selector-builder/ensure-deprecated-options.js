import deprecate from '../../warnings/deprecate';
import { getCallsite } from '../../errors/callsite';

export default function ensureDeprecatedOptions (callsiteName, options) {
    if (options && (options.text || options.index || options.dependencies)) {
        var callsite = getCallsite(callsiteName);

        if (options.text) {
            deprecate(callsite, {
                what:       'selectorOptions.text',
                useInstead: 'selector.withText()'
            });
        }

        if (options.index) {
            deprecate(callsite, {
                what:       'selectorOptions.index',
                useInstead: 'selector.nth()'
            });
        }

        if (options.dependencies) {
            deprecate(callsite, {
                what:       'selectorOptions.dependencies',
                useInstead: 'hierarchical selectors (e.g. selector.find())'
            });
        }
    }
}
