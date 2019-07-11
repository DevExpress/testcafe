import Configuration from './configuration-base';
import optionSource from './option-source';
import { DEFAULT_TYPESCRIPT_COMPILER_OPTIONS, TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS, TYPESCRIPT_BLACKLISTED_OPTIONS } from './default-values';
import { intersection, omit } from 'lodash';
import WARNING_MESSAGES from '../notifications/warning-message';
import renderTemplate from '../utils/render-template';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';

const lazyRequire = require('import-lazy')(require);
const typescript  = lazyRequire('typescript');

export default class TypescriptConfiguration extends Configuration {
    constructor (tsConfigPath) {
        const basePath = process.cwd();

        super(tsConfigPath);

        this.basePath = basePath;

        for (const option in DEFAULT_TYPESCRIPT_COMPILER_OPTIONS)
            this._ensureOptionWithValue(option, DEFAULT_TYPESCRIPT_COMPILER_OPTIONS[option], optionSource.configuration);
    }

    async init () {
        const opts = await this._load();

        if (opts && opts.compilerOptions) {
            const parsedOpts = this._parseOptions(opts);

            this.mergeOptions(parsedOpts);
        }

        this._notifyThatOptionsCannotBeOverriden();
    }

    async _isConfigurationFileExists () {
        const fileExists = await super._isConfigurationFileExists();

        if (!fileExists)
            throw new GeneralError(RUNTIME_ERRORS.cannotFindTypescriptConfigurationFile, this.filePath);

        return true;
    }

    _parseOptions (opts) {
        const parsed = typescript.parseJsonConfigFileContent(opts, typescript.sys, this.basePath, void 0, this._filePath);

        return omit(parsed.options, TYPESCRIPT_BLACKLISTED_OPTIONS);
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
