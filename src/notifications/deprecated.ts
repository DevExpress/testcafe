import renderTemplate from '../utils/render-template';
import WARNING_MESSAGES from './warning-message';
import OPTION_NAMES from '../configuration/option-names';
import CustomizableCompilers from '../configuration/customizable-compilers';

interface DeprecatedFunctionality {
    what: string;
    useInstead: string;
}

export const DEPRECATED: { [functionality: string]: DeprecatedFunctionality } = {
    'setPageLoadTimeout': {
        what:       'The \'TestController.setPageLoadTimeout\' method',
        useInstead: 'the \'Test.timeouts\' method to set the \'pageLoadTimeout\' option'
    },
    'tsConfigPath': {
        what:       `The '${OPTION_NAMES.tsConfigPath}' option`,
        useInstead: `the '${OPTION_NAMES.compilerOptions}.${CustomizableCompilers.typescript}.configPath' option`
    }
};

export function getDeprecationMessage (deprecated: DeprecatedFunctionality): string {
    return renderTemplate(WARNING_MESSAGES.deprecatedFunctionality, deprecated.what, deprecated.useInstead);
}
