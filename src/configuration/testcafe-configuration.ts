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
    getDefaultCompilerOptions
} from './default-values';

import OptionSource from './option-source';
import {
    Dictionary,
    FilterOption,
    ReporterOption,
    TypeScriptCompilerOptions
} from './interfaces';

import CustomizableCompilers from './customizable-compilers';
import { DEPRECATED_OPTIONS, DEPRECATED_OPTION_NAMES } from './deprecated-options';

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
    OPTION_NAMES.disableMultipleWindows
];

const OPTION_INIT_FLAG_NAMES = [
    OPTION_NAMES.developmentMode,
    OPTION_NAMES.retryTestPages,
    OPTION_NAMES.cache
];

interface TestCafeAdditionalStartOptions {
    retryTestPages: boolean;
    ssl: string;
    developmentMode: boolean;
    cache: boolean;
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

    public async init (options?: object): Promise<void> {
        options = options || {};

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
        this._prepareCompilerOptions();
    }

    public notifyAboutOverriddenOptions (): void {
        if (!this._overriddenOptions.length)
            return;

        const optionsStr    = getConcatenatedValuesString(this._overriddenOptions);
        const optionsSuffix = getPluralSuffix(this._overriddenOptions);

        Configuration._showConsoleWarning(renderTemplate(WARNING_MESSAGES.configOptionsWereOverridden, optionsStr, optionsSuffix));

        this._overriddenOptions = [];
    }

    public notifyAboutDeprecatedOptions (): void {
        const deprecatedOptionsObj = this.getOptions((name, option) => {
            return DEPRECATED_OPTION_NAMES.includes(name) &&
                option.value !== void 0;
        });

        const deprecatedOptionNames = Object.keys(deprecatedOptionsObj);

        if (!deprecatedOptionNames.length)
            return;

        const deprecatedOptions = DEPRECATED_OPTIONS.filter(deprecatedOption => deprecatedOptionNames.includes(deprecatedOption.what));

        const replacements = deprecatedOptions.reduce((result, current) => {
            result += renderTemplate(WARNING_MESSAGES.deprecatedOptionsReplacement, current.what, current.useInstead);

            return result;
        }, '');

        Configuration._showConsoleWarning(renderTemplate(WARNING_MESSAGES.deprecatedOptionsAreUsed, replacements));
    }

    public get startOptions (): TestCafeStartOptions {
        const result: TestCafeStartOptions = {
            hostname: this.getOption(OPTION_NAMES.hostname) as string,
            port1:    this.getOption(OPTION_NAMES.port1) as number,
            port2:    this.getOption(OPTION_NAMES.port2) as number,

            options: {
                ssl:             this.getOption(OPTION_NAMES.ssl) as string,
                developmentMode: this.getOption(OPTION_NAMES.developmentMode) as boolean,
                retryTestPages:  this.getOption(OPTION_NAMES.retryTestPages) as boolean,
                cache:           this.getOption(OPTION_NAMES.cache) as boolean
            }
        };

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

    private _prepareCompilerOptions (): void {
        const compilerOptions = this._ensureOption(OPTION_NAMES.compilerOptions, getDefaultCompilerOptions(), OptionSource.Configuration);

        compilerOptions.value = compilerOptions.value || getDefaultCompilerOptions();

        const tsConfigPath = this.getOption(OPTION_NAMES.tsConfigPath);

        if (tsConfigPath) {
            const compilerOptionValue     = compilerOptions.value as CompilerOptions;
            let typeScriptCompilerOptions = compilerOptionValue[CustomizableCompilers.typescript] as TypeScriptCompilerOptions;

            typeScriptCompilerOptions = Object.assign({
                configPath: tsConfigPath
            }, typeScriptCompilerOptions);

            (compilerOptions.value as CompilerOptions)[CustomizableCompilers.typescript] = typeScriptCompilerOptions;
        }
    }

    public static get FILENAME (): string {
        return CONFIGURATION_FILENAME;
    }
}
