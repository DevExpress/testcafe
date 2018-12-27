import Promise from 'pinkie';
import { fsObjectExists, readFile } from '../utils/promisified-functions';
import Option from './option';
import optionSource from './option-source';
import { cloneDeep, castArray } from 'lodash';
import { ensureOptionValue as ensureSslOptionValue } from '../utils/parse-ssl-options';
import OPTION_NAMES from './option-names';
import { optionValueToRegExp } from './option-conversion';
import createFilterFn from '../utils/create-filter-fn';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';
import JSON5 from 'json5';
import warningMessage from '../notifications/warning-message';
import renderTemplate from '../utils/render-template';

const CONFIGURATION_FILENAME = '.testcaferc.json';

const STATIC_CONTENT_CACHING_SETTINGS = {
    maxAge:         3600,
    mustRevalidate: false
};

export default class Configuration {
    constructor () {
        this._options  = {};
        this._filePath = resolvePathRelativelyCwd(CONFIGURATION_FILENAME);
    }

    static _isArrayWithOneUndefinedItem (obj) {
        return Array.isArray(obj) &&
               obj.length === 1 &&
               obj[0] === void 0;
    }

    static _fromObj (obj) {
        const result = Object.create(null);

        Object.entries(obj).forEach(([key, value]) => {
            const option = new Option(key, value);

            result[key] = option;
        });

        return result;
    }

    async _load () {
        if (!await fsObjectExists(this.filePath))
            return;

        let configurationFileContent = null;

        try {
            configurationFileContent = await readFile(this.filePath);
        }
        catch (e) {
            console.log(warningMessage.errorReadConfigFile); // eslint-disable-line no-console
        }

        try {
            const optionsObj = JSON5.parse(configurationFileContent);

            this._options = Configuration._fromObj(optionsObj);
        }
        catch (e) {
            console.log(warningMessage.errorConfigFileCannotBeParsed); // eslint-disable-line no-console
        }

        await this._prepareOptions();
    }

    async _prepareOptions () {
        await this._prepareSslOptions();
        this._prepareFilterFn();
        this._ensureArrayOption(OPTION_NAMES.src);
        this._ensureArrayOption(OPTION_NAMES.browsers);
        this._ensureArrayOption(OPTION_NAMES.reporter);
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

        const { test, fixture, testGrep, fixtureGrep, testMeta, fixtureMeta } = filterOption;

        const opts = {
            testGrep:    optionValueToRegExp('testGrep', testGrep),
            fixtureGrep: optionValueToRegExp('FixtureGrep', fixtureGrep),
            test,
            fixture,
            testMeta,
            fixtureMeta
        };

        filterOption.value = createFilterFn(opts);
    }

    async _prepareSslOptions () {
        const sslOptions = this._options[OPTION_NAMES.ssl];

        if (!sslOptions)
            return;

        await Promise.all(Object.entries(sslOptions.value).map(async ([key, value]) => {
            sslOptions.value[key] = await ensureSslOptionValue(key, value);
        }));
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

    async init (options = {}) {
        await this._load();
        this.mergeOptions(options);
    }

    mergeOptions (options) {
        const overridenOptions = [];

        Object.entries(options).map(([key, value]) => {
            const option = this._ensureOption(key, value, optionSource.input);

            if (value === void 0 || Configuration._isArrayWithOneUndefinedItem(value))
                return;

            if (option.value !== value &&
                option.source === optionSource.configuration)
                overridenOptions.push(key);

            option.value  = value;
            option.source = optionSource.input;
        });

        if (overridenOptions.length) {
            const optionsStr    = overridenOptions.map(option => `"${option}"`).join(', ');
            const optionsSuffix = overridenOptions.length > 1 ? 's' : '';

            console.log(renderTemplate(warningMessage.configOptionsWereOverriden, optionsStr, optionsSuffix)); // eslint-disable-line no-console
        }
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
