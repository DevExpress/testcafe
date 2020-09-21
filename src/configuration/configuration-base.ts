import { isAbsolute } from 'path';
import debug from 'debug';
import JSON5 from 'json5';
import {
    castArray,
    cloneDeep,
    isPlainObject,
    mergeWith
} from 'lodash';

import { stat, readFile } from '../utils/promisified-functions';
import Option from './option';
import OptionSource from './option-source';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';
import renderTemplate from '../utils/render-template';
import WARNING_MESSAGES from '../notifications/warning-message';
import log from '../cli/log';
import { Dictionary } from './interfaces';

const DEBUG_LOGGER = debug('testcafe:configuration');

export default class Configuration {
    protected _options: Dictionary<Option>;
    protected readonly _filePath: string | null;
    protected _overriddenOptions: string[];

    public constructor (configurationFileName: string | null) {
        this._options  = {};
        this._filePath = Configuration._resolveFilePath(configurationFileName);

        this._overriddenOptions = [];
    }

    protected static _fromObj (obj: object): Dictionary<Option> {
        const result = Object.create(null);

        Object.entries(obj).forEach(([key, value]) => {
            const option = new Option(key, value);

            result[key] = option;
        });

        return result;
    }

    protected static _showConsoleWarning (message: string): void {
        log.write(message);
    }

    private static _showWarningForError (error: Error, warningTemplate: string, ...args: TemplateArguments): void {
        const message = renderTemplate(warningTemplate, ...args);

        Configuration._showConsoleWarning(message);

        DEBUG_LOGGER(message);
        DEBUG_LOGGER(error);
    }

    private static _resolveFilePath (path: string | null): string | null {
        if (!path)
            return null;

        return isAbsolute(path) ? path : resolvePathRelativelyCwd(path);
    }

    public async init (): Promise<void> {
        this._overriddenOptions = [];
    }

    public mergeOptions (options: object): void {
        Object.entries(options).map(([key, value]) => {
            const option = this._ensureOption(key, value, OptionSource.Input);

            if (value === void 0)
                return;

            this._setOptionValue(option, value);
        });
    }

    protected mergeDeep (option: Option, source: object): void {
        mergeWith(option.value, source, (targetValue: OptionValue, sourceValue: OptionValue, property: string) => {
            this._addOverriddenOptionIfNecessary(targetValue, sourceValue, option.source, `${option.name}.${property}`);

            return sourceValue !== void 0 ? sourceValue : targetValue;
        });
    }

    public getOption (key: string): OptionValue {
        if (!key)
            return void 0;

        const option = this._options[key];

        if (!option)
            return void 0;

        return option.value;
    }

    public getOptions (predicate?: (name: string, option: Option) => boolean): Dictionary<OptionValue> {
        const result        = Object.create(null);
        let includeInResult = true;

        Object.entries(this._options).forEach(([name, option]) => {
            includeInResult = predicate ? predicate(name, option) : true;

            if (includeInResult)
                result[name] = option.value;
        });

        return result;
    }

    public clone (): Configuration {
        return cloneDeep(this);
    }

    public get filePath (): string | null {
        return this._filePath;
    }

    public async _load (): Promise<null | object> {
        if (!this.filePath)
            return null;

        if (!await this._isConfigurationFileExists())
            return null;

        const configurationFileContent = await this._readConfigurationFileContent();

        if (!configurationFileContent)
            return null;

        return this._parseConfigurationFileContent(configurationFileContent);
    }

    protected async _isConfigurationFileExists (): Promise<boolean> {
        try {
            await stat(this.filePath);

            return true;
        }
        catch (error) {
            DEBUG_LOGGER(renderTemplate(WARNING_MESSAGES.cannotFindConfigurationFile, this.filePath, error.stack));

            return false;
        }
    }

    public async _readConfigurationFileContent (): Promise<Buffer | null> {
        try {
            return await readFile(this.filePath);
        }
        catch (error) {
            Configuration._showWarningForError(error, WARNING_MESSAGES.cannotReadConfigFile);
        }

        return null;
    }

    private _parseConfigurationFileContent (configurationFileContent: Buffer): object | null {
        try {
            return JSON5.parse(configurationFileContent.toString());
        }
        catch (error) {
            Configuration._showWarningForError(error, WARNING_MESSAGES.cannotParseConfigFile, this._filePath);
        }

        return null;
    }

    protected _ensureArrayOption (name: string): void {
        const options = this._options[name];

        if (!options)
            return;

        // NOTE: a hack to fix lodash type definitions
        // @ts-ignore
        options.value = castArray(options.value);
    }

    protected _ensureOption (name: string, value: OptionValue, source: OptionSource): Option {
        let option = null;

        if (name in this._options)
            option = this._options[name];
        else {
            option = new Option(name, value, source);

            this._options[name] = option;
        }

        return option;
    }

    protected _ensureOptionWithValue (name: string, defaultValue: OptionValue, source: OptionSource): void {
        const option = this._ensureOption(name, defaultValue, source);

        if (option.value !== void 0)
            return;

        option.value  = defaultValue;
        option.source = source;
    }

    protected _addOverriddenOptionIfNecessary (value1: OptionValue, value2: OptionValue, source: OptionSource, optionName: string): void {
        if (value1 === void 0 || value2 === void 0 || value1 === value2 || source !== OptionSource.Configuration)
            return;

        this._overriddenOptions.push(optionName);
    }

    protected _setOptionValue (option: Option, value: OptionValue): void {
        if (isPlainObject(option.value) && isPlainObject(value))
            this.mergeDeep(option, value as object);
        else {
            this._addOverriddenOptionIfNecessary(option.value, value, option.source, option.name);

            option.value = value;
        }

        option.source = OptionSource.Input;
    }
}
