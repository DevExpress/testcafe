import renderTemplate from '../utils/render-template';
import WARNING_MESSAGES from './warning-message';
import OPTION_NAMES from '../configuration/option-names';
import CustomizableCompilers from '../configuration/customizable-compilers';

interface DeprecatedAPI {
    what: string;
    useInstead: string;
}

export const DEPRECATED: { [functionality: string]: DeprecatedAPI } = {
    'setPageLoadTimeout': {
        what:       "The 't.setPageLoadTimeout' method",
        useInstead: "the 'test.timeouts' method to set the 'pageLoadTimeout'"
    },
    'tsConfigPath': {
        what:       `The '${OPTION_NAMES.tsConfigPath}' option`,
        useInstead: `the '${OPTION_NAMES.compilerOptions}.${CustomizableCompilers.typescript}.configPath' option`
    }
};

export function getDeprecationMessage (deprecated: DeprecatedAPI): string {
    return renderTemplate(WARNING_MESSAGES.deprecatedAPI, deprecated.what, deprecated.useInstead);
}
