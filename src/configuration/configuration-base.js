import { isAbsolute } from 'path';
import debug from 'debug';
import JSON5 from 'json5';
import { cloneDeep, castArray } from 'lodash';
import { stat, readFile } from '../utils/promisified-functions';
import Option from './option';
import optionSource from './option-source';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';
import renderTemplate from '../utils/render-template';
import WARNING_MESSAGES from '../notifications/warning-message';
import log from '../cli/log';

const DEBUG_LOGGER = debug('testcafe:configuration');

export default class Configuration {
    constructor (configurationFileName) {
        this._options  = {};
        this._filePath = Configuration._resolveFilePath(configurationFileName);

        this._overridenOptions = [];
    }

    static _fromObj (obj) {
        const result = Object.create(null);

        Object.entries(obj).forEach(([key, value]) => {
            const option = new Option(key, value);

            result[key] = option;
        });

        return result;
    }

    static _showConsoleWarning (message) {
        log.write(message);
    }

    static _showWarningForError (error, warningTemplate, ...args) {
        const message = renderTemplate(warningTemplate, ...args);

        Configuration._showConsoleWarning(message);

        DEBUG_LOGGER(message);
        DEBUG_LOGGER(error);
    }

    static _resolveFilePath (path) {
        if (!path)
            return null;

        return isAbsolute(path) ? path : resolvePathRelativelyCwd(path);
    }

    async init () {
    }

    mergeOptions (options) {
        Object.entries(options).map(([key, value]) => {
            const option = this._ensureOption(key, value, optionSource.input);

            if (value === void 0)
                return;

            if (option.value !== value &&
                option.source === optionSource.configuration)
                this._overridenOptions.push(key);

            this._setOptionValue(option, value);
        });
    }

    getOption (key) {
        if (!key)
            return void 0;

        const option = this._options[key];

        if (!option)
            return void 0;

        return option.value;
    }

    getOptions () {
        const result = Object.create(null);

        Object.entries(this._options).forEach(([name, option]) => {
            result[name] = option.value;
        });

        return result;
    }

    clone () {
        return cloneDeep(this);
    }

    get filePath () {
        return this._filePath;
    }

    async _load () {
        if (!this.filePath)
            return null;

        if (!await this._isConfigurationFileExists())
            return null;

        const configurationFileContent = await this._readConfigurationFileContent();

        if (!configurationFileContent)
            return null;

        return this._parseConfigurationFileContent(configurationFileContent);
    }

    async _isConfigurationFileExists () {
        try {
            await stat(this.filePath);

            return true;
        }
        catch (error) {
            DEBUG_LOGGER(renderTemplate(WARNING_MESSAGES.cannotFindConfigurationFile, this.filePath, error.stack));

            return false;
        }
    }

    async _readConfigurationFileContent () {
        try {
            return await readFile(this.filePath);
        }
        catch (error) {
            Configuration._showWarningForError(error, WARNING_MESSAGES.cannotReadConfigFile);
        }

        return null;
    }

    _parseConfigurationFileContent (configurationFileContent) {
        try {
            return JSON5.parse(configurationFileContent);
        }
        catch (error) {
            Configuration._showWarningForError(error, WARNING_MESSAGES.cannotParseConfigFile);
        }

        return null;
    }

    _ensureArrayOption (name) {
        const options = this._options[name];

        if (!options)
            return;

        options.value = castArray(options.value);
    }

    _ensureOption (name, value, source) {
        let option = null;

        if (name in this._options)
            option = this._options[name];
        else {
            option = new Option(name, value, source);

            this._options[name] = option;
        }

        return option;
    }

    _ensureOptionWithValue (name, defaultValue, source) {
        const option = this._ensureOption(name, defaultValue, source);

        if (option.value !== void 0)
            return;

        option.value  = defaultValue;
        option.source = source;
    }

    _setOptionValue (option, value) {
        option.value  = value;
        option.source = optionSource.input;
    }
}
