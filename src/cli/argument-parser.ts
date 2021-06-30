import { has, set } from 'lodash';
import { Command } from 'commander';
import dedent from 'dedent';
import { readSync as read } from 'read-file-relative';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import { assertType, is } from '../errors/runtime/type-assertions';
import getViewPortWidth from '../utils/get-viewport-width';
import { wordWrap, splitQuotedText } from '../utils/string';
import {
    getSSLOptions,
    getQuarantineOptions,
    getScreenshotOptions,
    getVideoOptions,
    getMetaOptions,
    getGrepOptions,
    getCompilerOptions
} from '../utils/get-options';

import getFilterFn from '../utils/get-filter-fn';
import SCREENSHOT_OPTION_NAMES from '../configuration/screenshot-option-names';
import RUN_OPTION_NAMES from '../configuration/run-option-names';
import {
    Dictionary,
    ReporterOption,
    RunnerRunOptions
} from '../configuration/interfaces';
import QUARANTINE_OPTION_NAMES from '../configuration/quarantine-option-names';


const REMOTE_ALIAS_RE = /^remote(?::(\d*))?$/;

const DESCRIPTION = dedent(`
    In the browser list, you can use browser names (e.g. "ie", "chrome", etc.) as well as paths to executables.

    To run tests against all installed browsers, use the "all" alias.

    To use a remote browser connection (e.g., to connect a mobile device), specify "remote" as the browser alias.
    If you need to connect multiple devices, add a colon and the number of browsers you want to connect (e.g., "remote:3").

    To run tests in a browser accessed through a browser provider plugin, specify a browser alias that consists of two parts - the browser provider name prefix and the name of the browser itself; for example, "saucelabs:chrome@51".

    You can use one or more file paths or glob patterns to specify which tests to run.

    More info: https://devexpress.github.io/testcafe/documentation
`);

interface CommandLineOptions {
    testGrep?: string | RegExp;
    fixtureGrep?: string | RegExp;
    src?: string[];
    browsers?: string[];
    listBrowsers?: boolean | string;
    testMeta?: string | Dictionary<string | number | boolean>;
    fixtureMeta?: string | Dictionary<string | number | boolean>;
    filter?: Function;
    appInitDelay?: string | number;
    assertionTimeout?: string | number;
    selectorTimeout?: string | number;
    speed?: string | number;
    pageLoadTimeout?: string | number;
    pageRequestTimeout?: string | number;
    ajaxRequestTimeout?: string | number;
    browserInitTimeout?: string | number;
    concurrency?: string | number;
    quarantineMode?: boolean | Dictionary<string | number>;
    ports?: string | number[];
    providerName?: string;
    ssl?: string | Dictionary<string | number | boolean >;
    reporter?: string | ReporterOption[];
    screenshots?: Dictionary<string | number | boolean> | string;
    screenshotPathPattern?: string;
    screenshotsOnFails?: boolean;
    videoOptions?: string | Dictionary<number | string | boolean>;
    videoEncodingOptions?: string | Dictionary<number | string | boolean>;
    compilerOptions?: string | Dictionary<number | string | boolean>;
    configFile?: string;
    isProxyless?: boolean;
}

export default class CLIArgumentParser {
    private readonly program: Command;
    private readonly experimental: Command;
    private cwd: string;
    private remoteCount: number;
    public opts: CommandLineOptions;
    public args: string[];

    public constructor (cwd: string) {
        this.program      = new Command('testcafe');
        this.experimental = new Command('testcafe-experimental');
        this.cwd          = cwd || process.cwd();
        this.remoteCount  = 0;
        this.opts         = {};
        this.args         = [];

        this._describeProgram();
    }

    private static _parsePortNumber (value: string): number {
        assertType(is.nonNegativeNumberString, null, 'The port number', value);

        return parseInt(value, 10);
    }

    private static _getDescription (): string {
        // NOTE: add empty line to workaround commander-forced indentation on the first line.
        return '\n' + wordWrap(DESCRIPTION, 2, getViewPortWidth(process.stdout));
    }

    private _describeProgram (): void {
        const version = JSON.parse(read('../../package.json') as string).version;

        this.program
            .version(version, '-v, --version')
            .usage('[options] <comma-separated-browser-list> <file-or-glob ...>')
            .description(CLIArgumentParser._getDescription())

            .option('-b, --list-browsers [provider]', 'output the aliases for local browsers or browsers available through the specified browser provider')
            .option('-r, --reporter <name[:outputFile][,...]>', 'specify the reporters and optionally files where reports are saved')
            .option('-s, --screenshots <option=value[,...]>', 'specify screenshot options')
            .option('-S, --screenshots-on-fails', 'take a screenshot whenever a test fails')
            .option('-p, --screenshot-path-pattern <pattern>', 'use patterns to compose screenshot file names and paths: ${BROWSER}, ${BROWSER_VERSION}, ${OS}, etc.')
            .option('-q, --quarantine-mode [option=value,...]', 'enable quarantine mode and (optionally) modify quarantine mode settings')
            .option('-d, --debug-mode', 'execute test steps one by one pausing the test after each step')
            .option('-e, --skip-js-errors', 'make tests not fail when a JS error happens on a page')
            .option('-u, --skip-uncaught-errors', 'ignore uncaught errors and unhandled promise rejections, which occur during test execution')
            .option('-t, --test <name>', 'run only tests with the specified name')
            .option('-T, --test-grep <pattern>', 'run only tests matching the specified pattern')
            .option('-f, --fixture <name>', 'run only fixtures with the specified name')
            .option('-F, --fixture-grep <pattern>', 'run only fixtures matching the specified pattern')
            .option('-a, --app <command>', 'launch the tested app using the specified command before running tests')
            .option('-c, --concurrency <number>', 'run tests concurrently')
            .option('-L, --live', 'enable live mode. In this mode, TestCafe watches for changes you make in the test files. These changes immediately restart the tests so that you can see the effect.')
            .option('--test-meta <key=value[,key2=value2,...]>', 'run only tests with matching metadata')
            .option('--fixture-meta <key=value[,key2=value2,...]>', 'run only fixtures with matching metadata')
            .option('--debug-on-fail', 'pause the test if it fails')
            .option('--app-init-delay <ms>', 'specify how much time it takes for the tested app to initialize')
            .option('--selector-timeout <ms>', 'specify the time within which selectors make attempts to obtain a node to be returned')
            .option('--assertion-timeout <ms>', 'specify the time within which assertion should pass')
            .option('--page-load-timeout <ms>', 'specify the time within which TestCafe waits for the `window.load` event to fire on page load before proceeding to the next test action')
            .option('--page-request-timeout <ms>', "specifies the timeout in milliseconds to complete the request for the page's HTML")
            .option('--ajax-request-timeout <ms>', 'specifies the timeout in milliseconds to complete the AJAX requests (XHR or fetch)')
            .option('--browser-init-timeout <ms>', 'specify the time (in milliseconds) TestCafe waits for the browser to start')
            .option('--speed <factor>', 'set the speed of test execution (0.01 ... 1)')
            .option('--ports <port1,port2>', 'specify custom port numbers')
            .option('--hostname <name>', 'specify the hostname')
            .option('--proxy <host>', 'specify the host of the proxy server')
            .option('--proxy-bypass <rules>', 'specify a comma-separated list of rules that define URLs accessed bypassing the proxy server')
            .option('--ssl <options>', 'specify SSL options to run TestCafe proxy server over the HTTPS protocol')
            .option('--video <path>', 'record videos of test runs')
            .option('--video-options <option=value[,...]>', 'specify video recording options')
            .option('--video-encoding-options <option=value[,...]>', 'specify encoding options')
            .option('--dev', 'enables mechanisms to log and diagnose errors')
            .option('--qr-code', 'outputs QR-code that repeats URLs used to connect the remote browsers')
            .option('--sf, --stop-on-first-fail', 'stop an entire test run if any test fails')
            .option('--config-file <path>', 'specify a custom path to the testcafe configuration file')
            .option('--ts-config-path <path>', 'use a custom TypeScript configuration file and specify its location')
            .option('--cs, --client-scripts <paths>', 'inject scripts into tested pages', this._parseList, [])
            .option('--disable-page-caching', 'disable page caching during test execution')
            .option('--disable-page-reloads', 'disable page reloads between tests')
            .option('--retry-test-pages', 'retry network requests to test pages during test execution')
            .option('--disable-screenshots', 'disable screenshots')
            .option('--screenshots-full-page', 'enable full-page screenshots')
            .option('--compiler-options <option=value[,...]>', 'specify test file compiler options')

            // NOTE: these options will be handled by chalk internally
            .option('--color', 'force colors in command line')
            .option('--no-color', 'disable colors in command line');

        // NOTE: temporary hide experimental options from --help command
        this.experimental
            .allowUnknownOption()
            .option('--disable-multiple-windows', 'disable multiple windows mode')
            .option('--experimental-compiler-service', 'run compiler in a separate process')
            .option('--cache', 'cache web assets between test runs');
    }

    private _parseList (val: string): string[] {
        return val.split(',');
    }

    private _checkAndCountRemotes (browser: string): boolean {
        const remoteMatch = browser.match(REMOTE_ALIAS_RE);

        if (remoteMatch) {
            this.remoteCount += parseInt(remoteMatch[1], 10) || 1;

            return false;
        }

        return true;
    }

    public async _parseFilteringOptions (): Promise<void> {
        if (this.opts.testGrep)
            this.opts.testGrep = getGrepOptions('--test-grep', this.opts.testGrep as string);

        if (this.opts.fixtureGrep)
            this.opts.fixtureGrep = getGrepOptions('--fixture-grep', this.opts.fixtureGrep as string);

        if (this.opts.testMeta)
            this.opts.testMeta = await getMetaOptions('--test-meta', this.opts.testMeta as string);

        if (this.opts.fixtureMeta)
            this.opts.fixtureMeta = await getMetaOptions('--fixture-meta', this.opts.fixtureMeta as string);

        this.opts.filter = getFilterFn(this.opts);
    }

    private _parseAppInitDelay (): void {
        if (this.opts.appInitDelay) {
            assertType(is.nonNegativeNumberString, null, 'The tested app initialization delay', this.opts.appInitDelay);

            this.opts.appInitDelay = parseInt(this.opts.appInitDelay as string, 10);
        }
    }

    private _parseSelectorTimeout (): void {
        if (this.opts.selectorTimeout) {
            assertType(is.nonNegativeNumberString, null, 'The Selector timeout', this.opts.selectorTimeout);

            this.opts.selectorTimeout = parseInt(this.opts.selectorTimeout as string, 10);
        }
    }

    private _parseAssertionTimeout (): void {
        if (this.opts.assertionTimeout) {
            assertType(is.nonNegativeNumberString, null, 'The assertion timeout', this.opts.assertionTimeout);

            this.opts.assertionTimeout = parseInt(this.opts.assertionTimeout as string, 10);
        }
    }

    private _parsePageLoadTimeout (): void {
        if (this.opts.pageLoadTimeout) {
            assertType(is.nonNegativeNumberString, null, 'The page load timeout', this.opts.pageLoadTimeout);

            this.opts.pageLoadTimeout = parseInt(this.opts.pageLoadTimeout as string, 10);
        }
    }

    private _parsePageRequestTimeout (): void {
        if (!this.opts.pageRequestTimeout)
            return;

        assertType(is.nonNegativeNumberString, null, 'The page request timeout', this.opts.pageRequestTimeout);

        this.opts.pageRequestTimeout = parseInt(this.opts.pageRequestTimeout as string, 10);
    }

    private _parseAjaxRequestTimeout (): void {
        if (!this.opts.ajaxRequestTimeout)
            return;

        assertType(is.nonNegativeNumberString, null, 'The AJAX request timeout', this.opts.ajaxRequestTimeout);

        this.opts.ajaxRequestTimeout = parseInt(this.opts.ajaxRequestTimeout as string, 10);
    }

    private _parseBrowserInitTimeout (): void {
        if (!this.opts.browserInitTimeout)
            return;

        assertType(is.nonNegativeNumberString, null, 'The browser initialization timeout', this.opts.browserInitTimeout);

        this.opts.browserInitTimeout = parseInt(this.opts.browserInitTimeout as string, 10);
    }

    private _parseSpeed (): void {
        if (this.opts.speed)
            this.opts.speed = parseFloat(this.opts.speed as string);
    }

    private _parseConcurrency (): void {
        if (this.opts.concurrency)
            this.opts.concurrency = parseInt(this.opts.concurrency as string, 10);
    }

    private async _parseQuarantineOptions (): Promise<void> {
        if (this.opts.quarantineMode)
            this.opts.quarantineMode = await getQuarantineOptions('--quarantine-mode', this.opts.quarantineMode);
    }

    private _parsePorts (): void {
        if (this.opts.ports) {
            const parsedPorts = (this.opts.ports as string) /* eslint-disable-line no-extra-parens */
                .split(',')
                .map(CLIArgumentParser._parsePortNumber);

            if (parsedPorts.length < 2)
                throw new GeneralError(RUNTIME_ERRORS.portsOptionRequiresTwoNumbers);

            this.opts.ports = parsedPorts as number[];
        }
    }

    private _parseBrowsersFromArgs (): void {
        const browsersArg = this.program.args[0] || '';

        this.opts.browsers = splitQuotedText(browsersArg, ',')
            .filter(browser => browser && this._checkAndCountRemotes(browser));
    }

    public async _parseSslOptions (): Promise<void> {
        if (this.opts.ssl)
            this.opts.ssl = await getSSLOptions(this.opts.ssl as string);
    }

    private async _parseReporters (): Promise<void> {
        const reporters = this.opts.reporter ? (this.opts.reporter as string).split(',') : []; /* eslint-disable-line no-extra-parens*/

        this.opts.reporter = reporters.map((reporter: string) => {
            const separatorIndex = reporter.indexOf(':');

            if (separatorIndex < 0)
                return { name: reporter };

            const name   = reporter.substring(0, separatorIndex);
            const output = reporter.substring(separatorIndex + 1);

            return { name, output };
        });
    }

    private _parseFileList (): void {
        this.opts.src = this.program.args.slice(1);
    }

    private async _parseScreenshotOptions (): Promise<void> {
        if (this.opts.screenshots)
            this.opts.screenshots = await getScreenshotOptions(this.opts.screenshots);
        else
            this.opts.screenshots = {};

        if (!has(this.opts.screenshots, SCREENSHOT_OPTION_NAMES.pathPattern) && this.opts.screenshotPathPattern)
            this.opts.screenshots[SCREENSHOT_OPTION_NAMES.pathPattern] = this.opts.screenshotPathPattern;

        if (!has(this.opts.screenshots, SCREENSHOT_OPTION_NAMES.takeOnFails) && this.opts.screenshotsOnFails)
            this.opts.screenshots[SCREENSHOT_OPTION_NAMES.takeOnFails] = this.opts.screenshotsOnFails;
    }

    private async _parseVideoOptions (): Promise<void> {
        if (this.opts.videoOptions)
            this.opts.videoOptions = await getVideoOptions(this.opts.videoOptions as string);

        if (this.opts.videoEncodingOptions)
            this.opts.videoEncodingOptions = await getVideoOptions(this.opts.videoEncodingOptions as string);
    }

    private async _parseCompilerOptions (): Promise<void> {
        if (!this.opts.compilerOptions)
            return;

        const parsedCompilerOptions = await getCompilerOptions(this.opts.compilerOptions as string);
        const resultCompilerOptions = Object.create(null);

        for (const [key, value] of Object.entries(parsedCompilerOptions))
            set(resultCompilerOptions, key, value);

        this.opts.compilerOptions = resultCompilerOptions;
    }

    private _parseListBrowsers (): void {
        const listBrowserOption = this.opts.listBrowsers;

        this.opts.listBrowsers = !!this.opts.listBrowsers;

        if (!this.opts.listBrowsers)
            return;

        this.opts.providerName = typeof listBrowserOption === 'string' ? listBrowserOption : 'locally-installed';
    }

    public async parse (argv: string[]): Promise<void> {
        // NOTE: move the quarantine mode options to the end of the array to avoid the wrong quarantine mode CLI options parsing (GH-6231)
        const quarantineOptionIndex = argv.findIndex(
            el => ['-q', '--quarantine-mode'].some(opt => el.startsWith(opt)));

        if (quarantineOptionIndex > -1) {
            const isNotLastOption       = quarantineOptionIndex < argv.length - 1;
            const shouldMoveOptionToEnd = isNotLastOption &&
                ![QUARANTINE_OPTION_NAMES.attemptLimit, QUARANTINE_OPTION_NAMES.successThreshold].some(opt => argv[quarantineOptionIndex + 1].startsWith(opt));

            if (shouldMoveOptionToEnd)
                argv.push(argv.splice(quarantineOptionIndex, 1)[0]);
        }


        this.program.parse(argv);
        this.experimental.parse(argv);

        this.args = this.program.args;

        this.opts = { ...this.experimental.opts(), ...this.program.opts() };

        this._parseListBrowsers();

        // NOTE: the '--list-browsers' option only lists browsers and immediately exits the app.
        // Therefore, we don't need to process other arguments.
        if (this.opts.listBrowsers)
            return;

        this._parseSelectorTimeout();
        this._parseAssertionTimeout();
        this._parsePageLoadTimeout();
        this._parsePageRequestTimeout();
        this._parseAjaxRequestTimeout();
        this._parseBrowserInitTimeout();
        this._parseAppInitDelay();
        this._parseSpeed();
        this._parsePorts();
        this._parseBrowsersFromArgs();
        this._parseConcurrency();
        this._parseFileList();

        await this._parseFilteringOptions();
        await this._parseQuarantineOptions();
        await this._parseScreenshotOptions();
        await this._parseVideoOptions();
        await this._parseCompilerOptions();
        await this._parseSslOptions();
        await this._parseReporters();
    }

    public getRunOptions (): RunnerRunOptions {
        const result = Object.create(null);

        RUN_OPTION_NAMES.forEach(optionName => {
            if (optionName in this.opts)
                // @ts-ignore a hack to add an index signature to interface
                result[optionName] = this.opts[optionName];
        });

        return result as RunnerRunOptions;
    }
}
