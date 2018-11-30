import path from 'path';
import Promise from 'pinkie';
import { fsObjectExists, readFile } from '../utils/promisified-functions';
import Option from './option';
import optionSource from './option-source';
import { cloneDeep } from 'lodash';
import { ensureOptionValue as ensureSslOptionValue } from '../utils/parse-ssl-options';
import OPTION_NAMES from './option-names';
import { optionValueToRegExp } from './option-conversion';
import createFilterFn from '../utils/create-filter-fn';

const CONFIGURATION_FILENAME = '.testcaferc.json';

const ERR_READ_CONFIG_FILE                 = 'An error is occurred during reading the configuration filename.';
const ERR_CONFIG_FILE_IS_NOT_WELLFORMATTED = 'Configuration filename is not well-formatted.';

const STATIC_CONTENT_CACHING_SETTINGS = {
    maxAge:         3600,
    mustRevalidate: false
};

export default class Configuration {
    constructor () {
        this._options  = {};
        this._filePath = path.resolve(process.cwd(), CONFIGURATION_FILENAME);
    }

    static _fromObj (obj) {
        const result = Object.create(null);

        Object.entries(obj).forEach(entry => {
            const key    = entry[0];
            const value  = entry[1];
            const option = new Option(key, value);

            result[key] = option;
        });

        return result;
    }

    async load () {
        if (!await fsObjectExists(this.filePath))
            return;

        let configurationFileContent = null;

        try {
            configurationFileContent = await readFile(this.filePath);
        }
        catch (e) {
            console.log(ERR_READ_CONFIG_FILE); // eslint-disable-line no-console
        }

        try {
            const optionsObj = JSON.parse(configurationFileContent);

            this._options = Configuration._fromObj(optionsObj);
        }
        catch (e) {
            console.log(ERR_CONFIG_FILE_IS_NOT_WELLFORMATTED); // eslint-disable-line no-console
        }

        await this._prepareOptions();
    }

    async _prepareOptions () {
        await this._prepareSslOptions();
        this._prepareFilterFn();
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

        await Promise.all(Object.entries(sslOptions.value).map(async entry => {
            const key   = entry[0];
            const value = entry[1];

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

    mergeOptions (options) {
        const overridenOptions = [];

        Object.entries(options).map(item => {
            const key    = item[0];
            const value  = item[1];
            const option = this._ensureOption(key, value, optionSource.input);

            if (value === void 0)
                return;

            if (option.value !== value &&
                option.source === optionSource.configuration)
                overridenOptions.push(key);

            option.value  = value;
            option.source = optionSource.input;
        });

        if (overridenOptions.length)
            console.log(`${overridenOptions.map(option => `"${option}"`).join(', ')} option${overridenOptions.length > 1 ? 's' : ''} from configuration file will be ignored.`); // eslint-disable-line no-console
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

        Object.entries(this._options).forEach(keyValueOption => {
            const name   = keyValueOption[0];
            const option = keyValueOption[1];

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
