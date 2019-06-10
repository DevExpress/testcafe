import Configuration from './configuration-base';
import optionSource from './option-source';
import { DEFAULT_TYPESCRIPT_COMPILER_OPTIONS, TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS } from './default-values';
import { intersection } from 'lodash';
import WARNING_MESSAGES from '../notifications/warning-message';
import renderTemplate from '../utils/render-template';

const DEFAULT_CONFIGURATION_FILENAME = 'tsconfig.json';

export default class TypescriptConfiguration extends Configuration {
    constructor (tsConfigPath) {
        super(tsConfigPath || DEFAULT_CONFIGURATION_FILENAME);

        for (const option in DEFAULT_TYPESCRIPT_COMPILER_OPTIONS)
            this._ensureOptionWithValue(option, DEFAULT_TYPESCRIPT_COMPILER_OPTIONS[option], optionSource.configuration);
    }

    async init () {
        const opts = await this._load();

        if (opts && opts.compilerOptions)
            this.mergeOptions(opts.compilerOptions);

        this._notifyThatOptionsCannotBeOverriden();
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
