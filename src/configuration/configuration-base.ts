import { isAbsolute, extname } from 'path';
import debug from 'debug';
import JSON5 from 'json5';
import {
    castArray,
    cloneDeep,
    isPlainObject,
    mergeWith,
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
    protected _filePath?: string;
    protected readonly _defaultPaths?: string[];
    protected _overriddenOptions: string[];

    public constructor (configurationFilesNames: string | null | string[]) {
        this._options   = {};

        if (configurationFilesNames) {
            this._defaultPaths = castArray(configurationFilesNames).reduce((result, name) => {
                const resolveFilePath = Configuration._resolveFilePath(name);

                if (resolveFilePath)
                    result.push(resolveFilePath);

                return result;
            }, [] as string[]);
        }

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

    public get filePath (): string | undefined {
        return this._filePath;
    }

    public get defaultPaths (): string[] | undefined {
        return this._defaultPaths;
    }

    public async _load (): Promise<null | object> {
        if (!this.defaultPaths?.length)
            return null;

        const options = await Promise.all(this.defaultPaths.map(async filePath => {
            if (!await this._isConfigurationFileExists(filePath))
                return null;

            if (this._isJSConfiguration(filePath))
                return this._readJsConfigurationFileContent(filePath);

            const configurationFileContent = await this._readConfigurationFileContent(filePath);

            if (!configurationFileContent)
                return null;

            return this._parseConfigurationFileContent(configurationFileContent);
        }));

        return options.reduce((result, option, index) => {
            if (option && result)
                Configuration._showConsoleWarning(WARNING_MESSAGES.multipleConfigurationFilesFound);
            else if (option) {
                this._filePath = this.defaultPaths?.[index];

                return option;
            }

            return result;
        }, null as (null | object));
    }

    protected async _isConfigurationFileExists (filePath = this.filePath): Promise<boolean> {
        try {
            await stat(filePath);

            return true;
        }
        catch (error) {
            DEBUG_LOGGER(renderTemplate(WARNING_MESSAGES.cannotFindConfigurationFile, filePath, error.stack));

            return false;
        }
    }

    protected _isJSConfiguration (filePath: string): boolean {
        return extname(filePath) === '.js';
    }

    public _readJsConfigurationFileContent (filePath = this.filePath): object | null {
        if (filePath) {
            try {
                delete require.cache[filePath];

                return require(filePath);
            }
            catch (error) {
                Configuration._showWarningForError(error, WARNING_MESSAGES.cannotReadConfigFile, filePath);
            }
        }

        return null;
    }

    public async _readConfigurationFileContent (filePath = this.filePath): Promise<Buffer | null> {
        try {
            return await readFile(filePath);
        }
        catch (error) {
            Configuration._showWarningForError(error, WARNING_MESSAGES.cannotReadConfigFile, filePath);
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
