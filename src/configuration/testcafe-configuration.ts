import Configuration from './configuration-base';
import { castArray } from 'lodash';
import { getGrepOptions, getSSLOptions } from '../utils/get-options';
import OPTION_NAMES from './option-names';
import getFilterFn from '../utils/get-filter-fn';
import prepareReporters from '../utils/prepare-reporters';
import { getConcatenatedValuesString, getPluralSuffix } from '../utils/string';
import renderTemplate from '../utils/render-template';
import WARNING_MESSAGES from '../notifications/warning-message';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';

import {
    DEFAULT_APP_INIT_DELAY,
    DEFAULT_CONCURRENCY_VALUE,
    DEFAULT_SPEED_VALUE,
    DEFAULT_TIMEOUT,
    DEFAULT_SOURCE_DIRECTORIES,
    DEFAULT_DEVELOPMENT_MODE,
    DEFAULT_RETRY_TEST_PAGES,
    STATIC_CONTENT_CACHING_SETTINGS
} from './default-values';

import OptionSource from './option-source';
import { Dictionary, FilterOption, ReporterOption, StaticContentCachingOptions } from './interfaces';

const CONFIGURATION_FILENAME = '.testcaferc.json';

const DEFAULT_SCREENSHOTS_DIRECTORY = 'screenshots';

const OPTION_FLAG_NAMES = [
    OPTION_NAMES.skipJsErrors,
    OPTION_NAMES.quarantineMode,
    OPTION_NAMES.debugMode,
    OPTION_NAMES.debugOnFail,
    OPTION_NAMES.skipUncaughtErrors,
    OPTION_NAMES.stopOnFirstFail,
    OPTION_NAMES.takeScreenshotsOnFails,
    OPTION_NAMES.disablePageCaching,
    OPTION_NAMES.disablePageReloads,
    OPTION_NAMES.disableScreenshots,
    OPTION_NAMES.allowMultipleWindows
];

const OPTION_INIT_FLAG_NAMES = [
    OPTION_NAMES.developmentMode,
    OPTION_NAMES.retryTestPages,
];

interface TestCafeAdditionalStartOptions {
    retryTestPages: boolean;
    ssl: string;
    staticContentCaching?: StaticContentCachingOptions;
    developmentMode: boolean;
}

interface TestCafeStartOptions {
    hostname?: string;
    port1?: number;
    port2?: number;
    options: TestCafeAdditionalStartOptions;
}

export default class TestCafeConfiguration extends Configuration {
    public constructor () {
        super(CONFIGURATION_FILENAME);
    }

    public async init (options = {}): Promise<void> {
        await super.init();

        const opts = await this._load();

        if (opts) {
            this._options = Configuration._fromObj(opts);

            await this._normalizeOptionsAfterLoad();
        }

        this.mergeOptions(options);
    }

    public prepare (): void {
        this._prepareFlags();
        this._setDefaultValues();
    }

    public notifyAboutOverriddenOptions (): void {
        if (!this._overriddenOptions.length)
            return;

        const optionsStr    = getConcatenatedValuesString(this._overriddenOptions);
        const optionsSuffix = getPluralSuffix(this._overriddenOptions);

        Configuration._showConsoleWarning(renderTemplate(WARNING_MESSAGES.configOptionsWereOverriden, optionsStr, optionsSuffix));

        this._overriddenOptions = [];
    }

    public get startOptions (): TestCafeStartOptions {
        const result: TestCafeStartOptions = {
            hostname: this.getOption('hostname') as string,
            port1:    this.getOption('port1') as number,
            port2:    this.getOption('port2') as number,

            options: {
                ssl:             this.getOption('ssl') as string,
                developmentMode: this.getOption('developmentMode') as boolean,
                retryTestPages:  this.getOption('retryTestPages') as boolean
            }
        };

        if (result.options.retryTestPages)
            result.options.staticContentCaching = STATIC_CONTENT_CACHING_SETTINGS;

        return result;
    }

    private _prepareFlag (name: string): void {
        const option = this._ensureOption(name, void 0, OptionSource.Configuration);

        option.value = !!option.value;
    }

    private _prepareFlags (): void {
        OPTION_FLAG_NAMES.forEach(name => this._prepareFlag(name));
    }

    private _prepareInitFlags (): void {
        OPTION_INIT_FLAG_NAMES.forEach(name => this._prepareFlag(name));
    }

    private async _normalizeOptionsAfterLoad (): Promise<void> {
        await this._prepareSslOptions();
        this._prepareInitFlags();
        this._prepareFilterFn();
        this._ensureArrayOption(OPTION_NAMES.src);
        this._ensureArrayOption(OPTION_NAMES.browsers);
        this._ensureArrayOption(OPTION_NAMES.clientScripts);
        this._prepareReporters();
    }

    private _prepareFilterFn (): void {
        const filterOption = this._ensureOption(OPTION_NAMES.filter, null, OptionSource.Configuration);

        if (!filterOption.value)
            return;

        const filterOptionValue = filterOption.value as FilterOption;

        if (filterOptionValue.testGrep)
            filterOptionValue.testGrep = getGrepOptions(OPTION_NAMES.filterTestGrep, filterOptionValue.testGrep as string);

        if (filterOptionValue.fixtureGrep)
            filterOptionValue.fixtureGrep = getGrepOptions(OPTION_NAMES.filterFixtureGrep, filterOptionValue.fixtureGrep as string);

        filterOption.value = getFilterFn(filterOption.value) as Function;
    }

    private _ensureScreenshotPath (): void {
        const path        = resolvePathRelativelyCwd(DEFAULT_SCREENSHOTS_DIRECTORY);
        const screenshots = this._ensureOption(OPTION_NAMES.screenshots, {}, OptionSource.Configuration).value as Dictionary<string>;

        if (!screenshots.path)
            screenshots.path = path;
    }

    private _prepareReporters (): void {
        const reporterOption = this._options[OPTION_NAMES.reporter];

        if (!reporterOption)
            return;

        const optionValue = castArray(reporterOption.value as ReporterOption);

        reporterOption.value = prepareReporters(optionValue);
    }

    private async _prepareSslOptions (): Promise<void> {
        const sslOptions = this._options[OPTION_NAMES.ssl];

        if (!sslOptions)
            return;

        sslOptions.value = await getSSLOptions(sslOptions.value as string) as Dictionary<string | boolean | number>;
    }

    private _setDefaultValues (): void {
        this._ensureOptionWithValue(OPTION_NAMES.selectorTimeout, DEFAULT_TIMEOUT.selector, OptionSource.Configuration);
        this._ensureOptionWithValue(OPTION_NAMES.assertionTimeout, DEFAULT_TIMEOUT.assertion, OptionSource.Configuration);
        this._ensureOptionWithValue(OPTION_NAMES.pageLoadTimeout, DEFAULT_TIMEOUT.pageLoad, OptionSource.Configuration);
        this._ensureOptionWithValue(OPTION_NAMES.speed, DEFAULT_SPEED_VALUE, OptionSource.Configuration);
        this._ensureOptionWithValue(OPTION_NAMES.appInitDelay, DEFAULT_APP_INIT_DELAY, OptionSource.Configuration);
        this._ensureOptionWithValue(OPTION_NAMES.concurrency, DEFAULT_CONCURRENCY_VALUE, OptionSource.Configuration);
        this._ensureOptionWithValue(OPTION_NAMES.src, DEFAULT_SOURCE_DIRECTORIES, OptionSource.Configuration);
        this._ensureOptionWithValue(OPTION_NAMES.developmentMode, DEFAULT_DEVELOPMENT_MODE, OptionSource.Configuration);
        this._ensureOptionWithValue(OPTION_NAMES.retryTestPages, DEFAULT_RETRY_TEST_PAGES, OptionSource.Configuration);

        this._ensureScreenshotPath();
    }

    public static get FILENAME (): string {
        return CONFIGURATION_FILENAME;
    }
}
