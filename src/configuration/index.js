import debug from 'debug';
import { stat, readFile } from '../utils/promisified-functions';
import Option from './option';
import optionSource from './option-source';
import { cloneDeep, castArray } from 'lodash';
import { getSSLOptions, getGrepOptions } from '../utils/get-options';
import OPTION_NAMES from './option-names';
import getFilterFn from '../utils/get-filter-fn';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';
import JSON5 from 'json5';
import renderTemplate from '../utils/render-template';
import prepareReporters from '../utils/prepare-reporters';
import WARNING_MESSAGES from '../notifications/warning-message';
import log from '../cli/log';
import { getConcatenatedValuesString, getPluralSuffix } from '../utils/string';

import {
    DEFAULT_TIMEOUT,
    DEFAULT_SPEED_VALUE,
    STATIC_CONTENT_CACHING_SETTINGS,
    DEFAULT_APP_INIT_DELAY,
    DEFAULT_CONCURRENCY_VALUE
} from './default-values';

const DEBUG_LOGGER = debug('testcafe:configuration');

const CONFIGURATION_FILENAME = '.testcaferc.json';

const OPTION_FLAG_NAMES = [
    OPTION_NAMES.skipJsErrors,
    OPTION_NAMES.disablePageReloads,
    OPTION_NAMES.quarantineMode,
    OPTION_NAMES.debugMode,
    OPTION_NAMES.debugOnFail,
    OPTION_NAMES.skipUncaughtErrors,
    OPTION_NAMES.stopOnFirstFail,
    OPTION_NAMES.takeScreenshotsOnFails
];

export default class Configuration {
    constructor () {
        this._options  = {};
        this._filePath = resolvePathRelativelyCwd(CONFIGURATION_FILENAME);
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

    static async _isConfigurationFileExists (path) {
        try {
            await stat(path);

            return true;
        }
        catch (error) {
            DEBUG_LOGGER(renderTemplate(WARNING_MESSAGES.cannotFindConfigurationFile, path, error.stack));

            return false;
        }
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

    async _load () {
        if (!await Configuration._isConfigurationFileExists(this.filePath))
            return;

        let configurationFileContent = null;

        try {
            configurationFileContent = await readFile(this.filePath);
        }
        catch (error) {
            Configuration._showWarningForError(error, WARNING_MESSAGES.cannotReadConfigFile);

            return;
        }

        try {
            const optionsObj = JSON5.parse(configurationFileContent);

            this._options = Configuration._fromObj(optionsObj);
        }
        catch (error) {
            Configuration._showWarningForError(error, WARNING_MESSAGES.cannotParseConfigFile);

            return;
        }

        await this._normalizeOptionsAfterLoad();
    }

    async _normalizeOptionsAfterLoad () {
        await this._prepareSslOptions();
        this._prepareFilterFn();
        this._ensureArrayOption(OPTION_NAMES.src);
        this._ensureArrayOption(OPTION_NAMES.browsers);
        this._prepareReporters();
    }

    _ensureArrayOption (name) {
        const options = this._options[name];

        if (!options)
            return;

        options.value = castArray(options.value);
    }

    _prepareFilterFn () {
        const filterOption = this._ensureOption(OPTION_NAMES.filter, null);

        if (!filterOption.value)
            return;

        if (filterOption.value.testGrep)
            filterOption.value.testGrep = getGrepOptions(OPTION_NAMES.filterTestGrep, filterOption.value.testGrep);

        if (filterOption.value.fixtureGrep)
            filterOption.value.fixtureGrep = getGrepOptions(OPTION_NAMES.filterFixtureGrep, filterOption.value.fixtureGrep);

        filterOption.value = getFilterFn(filterOption.value);
    }

    _prepareReporters () {
        const reporterOption = this._options[OPTION_NAMES.reporter];

        if (!reporterOption)
            return;

        const optionValue = castArray(reporterOption.value);

        reporterOption.value = prepareReporters(optionValue);
    }

    async _prepareSslOptions () {
        const sslOptions = this._options[OPTION_NAMES.ssl];

        if (!sslOptions)
            return;

        sslOptions.value = await getSSLOptions(sslOptions.value);
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

    async init (options = {}) {
        await this._load();
        this.mergeOptions(options);
    }

    mergeOptions (options) {
        Object.entries(options).map(([key, value]) => {
            const option = this._ensureOption(key, value, optionSource.input);

            if (value === void 0)
                return;

            if (option.value !== value &&
                option.source === optionSource.configuration)
                this._overridenOptions.push(key);

            option.value  = value;
            option.source = optionSource.input;
        });
    }

    _prepareFlags () {
        OPTION_FLAG_NAMES.forEach(name => {
            const option = this._ensureOption(name, void 0, optionSource.configuration);

            option.value = !!option.value;
        });
    }

    _setDefaultValues () {
        this._ensureOptionWithValue(OPTION_NAMES.selectorTimeout, DEFAULT_TIMEOUT.selector, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.assertionTimeout, DEFAULT_TIMEOUT.assertion, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.pageLoadTimeout, DEFAULT_TIMEOUT.pageLoad, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.speed, DEFAULT_SPEED_VALUE, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.appInitDelay, DEFAULT_APP_INIT_DELAY, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.concurrency, DEFAULT_CONCURRENCY_VALUE, optionSource.configuration);
    }

    prepare () {
        this._prepareFlags();
        this._setDefaultValues();
    }

    notifyAboutOverridenOptions () {
        if (!this._overridenOptions.length)
            return;

        const optionsStr    = getConcatenatedValuesString(this._overridenOptions);
        const optionsSuffix = getPluralSuffix(this._overridenOptions);

        Configuration._showConsoleWarning(renderTemplate(WARNING_MESSAGES.configOptionsWereOverriden, optionsStr, optionsSuffix));

        this._overridenOptions = [];
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

    get startOptions () {
        const result = {
            hostname: this.getOption('hostname'),
            port1:    this.getOption('port1'),
            port2:    this.getOption('port2'),
            options:  {
                ssl:             this.getOption('ssl'),
                developmentMode: this.getOption('developmentMode'),
                retryTestPages:  !!this.getOption('retryTestPages')
            }
        };

        if (result.options.retryTestPages)
            result.options.staticContentCaching = STATIC_CONTENT_CACHING_SETTINGS;

        return result;
    }

    get filePath () {
        return this._filePath;
    }
}
