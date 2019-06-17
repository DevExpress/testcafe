import Configuration from './configuration-base';
import optionSource from './option-source';
import { castArray } from 'lodash';
import { getSSLOptions, getGrepOptions } from '../utils/get-options';
import OPTION_NAMES from './option-names';
import getFilterFn from '../utils/get-filter-fn';
import prepareReporters from '../utils/prepare-reporters';
import { getConcatenatedValuesString, getPluralSuffix } from '../utils/string';
import renderTemplate from '../utils/render-template';
import WARNING_MESSAGES from '../notifications/warning-message';

import {
    DEFAULT_TIMEOUT,
    DEFAULT_SPEED_VALUE,
    STATIC_CONTENT_CACHING_SETTINGS,
    DEFAULT_APP_INIT_DELAY,
    DEFAULT_CONCURRENCY_VALUE
} from './default-values';

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

export default class TestCafeConfiguration extends Configuration {
    constructor () {
        super(CONFIGURATION_FILENAME);
    }

    async init (options = {}) {
        const opts = await this._load();

        if (opts) {
            this._options = Configuration._fromObj(opts);

            await this._normalizeOptionsAfterLoad();
        }

        this.mergeOptions(options);
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

    _prepareFlags () {
        OPTION_FLAG_NAMES.forEach(name => {
            const option = this._ensureOption(name, void 0, optionSource.configuration);

            option.value = !!option.value;
        });
    }

    async _normalizeOptionsAfterLoad () {
        await this._prepareSslOptions();
        this._prepareFilterFn();
        this._ensureArrayOption(OPTION_NAMES.src);
        this._ensureArrayOption(OPTION_NAMES.browsers);
        this._prepareReporters();
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

    _setDefaultValues () {
        this._ensureOptionWithValue(OPTION_NAMES.selectorTimeout, DEFAULT_TIMEOUT.selector, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.assertionTimeout, DEFAULT_TIMEOUT.assertion, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.pageLoadTimeout, DEFAULT_TIMEOUT.pageLoad, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.speed, DEFAULT_SPEED_VALUE, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.appInitDelay, DEFAULT_APP_INIT_DELAY, optionSource.configuration);
        this._ensureOptionWithValue(OPTION_NAMES.concurrency, DEFAULT_CONCURRENCY_VALUE, optionSource.configuration);
    }
}
