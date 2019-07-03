import Configuration from './configuration-base';
import optionSource from './option-source';
import { DEFAULT_TYPESCRIPT_COMPILER_OPTIONS, TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS } from './default-values';
import { intersection } from 'lodash';
import WARNING_MESSAGES from '../notifications/warning-message';
import renderTemplate from '../utils/render-template';

const lazyRequire = require('import-lazy')(require);
const typescript  = lazyRequire('typescript');

const DEFAULT_CONFIGURATION_FILENAME = 'tsconfig.json';

export default class TypescriptConfiguration extends Configuration {
    constructor (tsConfigPath) {
        super(tsConfigPath || DEFAULT_CONFIGURATION_FILENAME);

        for (const option in DEFAULT_TYPESCRIPT_COMPILER_OPTIONS)
            this._ensureOptionWithValue(option, DEFAULT_TYPESCRIPT_COMPILER_OPTIONS[option], optionSource.configuration);
    }

    // NOTE: define this as a static prop to avoid requiring TypeScript at start
    get POSSIBLE_VALUES_MAP () {
        return {
            'module': typescript.ModuleKind,

            'moduleResolution': {
                'classic': typescript.ModuleResolutionKind.Classic,
                'node':    typescript.ModuleResolutionKind.NodeJs
            },

            'target': {
                'es6': typescript.ScriptTarget.ES2015,

                ...typescript.ScriptTarget
            }
        };
    }

    async init () {
        const opts = await this._load();

        if (opts && opts.compilerOptions) {
            this._normalizeOpts(opts.compilerOptions);

            this.mergeOptions(opts.compilerOptions);
        }

        this._notifyThatOptionsCannotBeOverriden();
    }

    _normalizeTSOption (optionValue, optionEnum) {
        if (typeof optionValue === 'number')
            return optionValue;

        const optionKey = Object.keys(optionEnum).filter(key => key.toLowerCase() === optionValue.toLowerCase())[0];

        if (!optionKey)
            return optionValue;

        return optionEnum[optionKey];
    }

    _normalizeOpts (opts) {
        for (const option of TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS) {
            if (!opts[option])
                continue;

            opts[option] = this._normalizeTSOption(opts[option], this.POSSIBLE_VALUES_MAP[option]);
        }
    }

    _notifyThatOptionsCannotBeOverriden () {
        const warnedOptions = intersection(this._overridenOptions, TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS);

        if (!warnedOptions.length)
            return;

        const warningMessage = warnedOptions
            .map(option => renderTemplate(WARNING_MESSAGES.cannotOverrideTypeScriptConfigOptions, option))
            .join('\n');

        Configuration._showConsoleWarning(warningMessage);
    }

    _setOptionValue (option, value) {
        if (TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS.indexOf(option.name) === -1)
            super._setOptionValue(option, value);
    }
}
