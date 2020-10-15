import OPTION_NAMES from './option-names';
import CustomizableCompilers from './customizable-compilers';

const DEPRECATED_OPTIONS = [
    {
        what:       OPTION_NAMES.tsConfigPath.toString(),
        useInstead: `${OPTION_NAMES.compilerOptions}.${CustomizableCompilers.typescript}.configPath`
    }
];

const DEPRECATED_OPTION_NAMES = DEPRECATED_OPTIONS.map(deprecatedOption => deprecatedOption.what);

export {
    DEPRECATED_OPTIONS,
    DEPRECATED_OPTION_NAMES
};
