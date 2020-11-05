import Configuration from './configuration-base';
import {
    DEFAULT_TYPESCRIPT_COMPILER_OPTIONS,
    TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS,
    TYPESCRIPT_BLACKLISTED_OPTIONS
} from './default-values';

import { intersection, omit } from 'lodash';
import WARNING_MESSAGES from '../notifications/warning-message';
import renderTemplate from '../utils/render-template';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import Option from './option';
import OptionSource from './option-source';

const lazyRequire = require('import-lazy')(require);
const typescript  = lazyRequire('typescript');

interface TypescriptConfigurationOptions {
    compilerOptions?: object;
}

export default class TypescriptConfiguration extends Configuration {
    private readonly basePath: string;

    public constructor (tsConfigPath: string | null) {
        super(tsConfigPath);

        this.basePath = process.cwd();

        this._ensureDefaultOptions();
    }

    private _ensureDefaultOptions (): void {
        for (const option in DEFAULT_TYPESCRIPT_COMPILER_OPTIONS)
            this._ensureOptionWithValue(option, DEFAULT_TYPESCRIPT_COMPILER_OPTIONS[option], OptionSource.Configuration);
    }

    public async init (customCompilerOptions?: object): Promise<void> {
        const opts = await this._load() as TypescriptConfigurationOptions;

        if (opts && opts.compilerOptions) {
            const parsedOpts = this._parseOptions(opts);

            this.mergeOptions(parsedOpts);
        }

        if (customCompilerOptions)
            this.mergeOptions(customCompilerOptions);

        this._notifyThatOptionsCannotBeOverridden();
    }

    protected async _isConfigurationFileExists (): Promise<boolean> {
        const fileExists = await super._isConfigurationFileExists();

        if (!fileExists)
            throw new GeneralError(RUNTIME_ERRORS.cannotFindTypescriptConfigurationFile, this.filePath);

        return true;
    }

    public _parseOptions (opts: object): object {
        const parsed = typescript.parseJsonConfigFileContent(opts, typescript.sys, this.basePath, void 0, this._filePath);

        return omit(parsed.options, TYPESCRIPT_BLACKLISTED_OPTIONS);
    }

    private _notifyThatOptionsCannotBeOverridden (): void {
        const warnedOptions = intersection(this._overriddenOptions, TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS);

        if (!warnedOptions.length)
            return;

        const warningMessage = warnedOptions
            .map(option => renderTemplate(WARNING_MESSAGES.cannotOverrideTypeScriptConfigOptions, option))
            .join('\n');

        Configuration._showConsoleWarning(warningMessage);
    }

    protected _setOptionValue (option: Option, value: OptionValue): void {
        if (!TYPESCRIPT_COMPILER_NON_OVERRIDABLE_OPTIONS.includes(option.name))
            super._setOptionValue(option, value);
        else
            this._addOverriddenOptionIfNecessary(option.value, value, option.source, option.name);
    }
}
