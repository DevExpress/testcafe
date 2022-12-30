import { has, set } from 'lodash';

import program, {
    Command,
    Option,
} from 'commander';

import dedent from 'dedent';
import { GeneralError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import { assertType, is } from '../../errors/runtime/type-assertions';
import getViewPortWidth from '../../utils/get-viewport-width';
import { wordWrap, splitQuotedText } from '../../utils/string';
import {
    getSSLOptions,
    getQuarantineOptions,
    getScreenshotOptions,
    getSkipJsErrorsOptions,
    getVideoOptions,
    getMetaOptions,
    getGrepOptions,
    getCompilerOptions,
    getDashboardOptions,
} from '../../utils/get-options';

import getFilterFn from '../../utils/get-filter-fn';
import SCREENSHOT_OPTION_NAMES from '../../configuration/screenshot-option-names';
import RUN_OPTION_NAMES from '../../configuration/run-option-names';
import {
    Dictionary,
    ReporterOption,
    RunnerRunOptions,
} from '../../configuration/interfaces';
import QUARANTINE_OPTION_NAMES from '../../configuration/quarantine-option-names';
import { extractNodeProcessArguments } from '../node-arguments-filter';
import getTestcafeVersion from '../../utils/get-testcafe-version';
import { parsePortNumber, parseList } from './parse-utils';
import COMMAND_NAMES from './command-names';
import { SendReportState } from '../../dashboard/interfaces';
import { SKIP_JS_ERRORS_OPTIONS_OBJECT_OPTION_NAMES } from '../../configuration/skip-js-errors-option-names';

const REMOTE_ALIAS_RE = /^remote(?::(\d*))?$/;

const DESCRIPTION = dedent(`

    To select a browser, specify an alias ("ie", "chrome", etc.) or the path to the browser executable. You can select more than one browser.
    
    Use the "all" alias to run tests against all available browsers.   
    Use the "remote" alias to run tests on remote devices, like smartphones or tablets. Specify the number of remote browsers after the semicolon ("remote:3").
    If you use a browser provider plugin, specify both the name of the plugin and the name of the browser. Separate the two with a semicolon ("saucelabs:chrome@51").

    To execute multiple test files, specify multiple file paths or glob patterns.

    Full documentation: https://testcafe.io/documentation/402639/reference/command-line-interface
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
    testExecutionTimeout?: string | number;
    runExecutionTimeout?: string | number;
    concurrency?: string | number;
    quarantineMode?: boolean | Dictionary<string | number>;
    ports?: string | number[];
    providerName?: string;
    ssl?: string | Dictionary<string | number | boolean>;
    reporter?: string | ReporterOption[];
    screenshots?: Dictionary<string | number | boolean> | string;
    screenshotPathPattern?: string;
    screenshotsOnFails?: boolean;
    videoOptions?: string | Dictionary<number | string | boolean>;
    videoEncodingOptions?: string | Dictionary<number | string | boolean>;
    compilerOptions?: string | Dictionary<number | string | boolean>;
    configFile?: string;
    proxyless?: boolean;
    v8Flags?: string[];
    dashboardOptions?: string | Dictionary<string | boolean | number>;
    baseUrl?: string;
    skipJsErrors?: boolean | Dictionary<RegExp | string>;
}

export default class CLIArgumentParser {
    private cwd: string;
    private remoteCount: number;
    public isDashboardCommand: boolean;
    public sendReportState: SendReportState;
    public opts: CommandLineOptions;
    public args: string[];
    private readonly testCafeCommand: Command;

    public constructor (cwd?: string) {
        this.cwd         = cwd || process.cwd();
        this.remoteCount = 0;
        this.opts        = {};
        this.args        = [];

        this.isDashboardCommand = false;
        this.testCafeCommand    = this._addTestCafeCommand();

        this._patchHelpOutput(this.testCafeCommand);
        CLIArgumentParser._setupRootCommand();
    }

    private static _setupRootCommand (): void {
        // NOTE: We are forced to set the name of the root command to 'testcafe'
        // to avoid the automatic command name calculation using the executed file path.
        // It's necessary to correct command description for nested commands.
        (program as unknown as Command).name(COMMAND_NAMES.TestCafe);
    }

    private static _removeCommandIfExists (name: string): void {
        // NOTE: Bug in the 'commander' module.
        // It's possible to add a few commands with the same name.
        // Also, removing is a better than conditionally adding
        // because it allows avoiding the parsed option duplicates.
        const index = (program as unknown as Command).commands.findIndex(cmd => cmd.name() === name);

        if (index > -1)
            (program as unknown as Command).commands.splice(index, 1);
    }

    private static _getDescription (): string {
        // NOTE: add empty line to workaround commander-forced indentation on the first line.
        return '\n' + wordWrap(DESCRIPTION, 2, getViewPortWidth(process.stdout));
    }

    private _addTestCafeCommand (): Command {
        CLIArgumentParser._removeCommandIfExists(COMMAND_NAMES.TestCafe);

        return (program as unknown as Command)
            .command(COMMAND_NAMES.TestCafe, { isDefault: true })
            .version(getTestcafeVersion(), '-v, --version')
            .usage('[options] <comma-separated-browser-list> <file-or-glob ...>')
            .description(CLIArgumentParser._getDescription())

            .allowUnknownOption()
            .option('-b, --list-browsers [provider]', 'display the list of aliases for available browsers and browser providers')
            .option('-r, --reporter <name[:outputFile][,...]>', 'specify reporters and report filenames')
            .option('-s, --screenshots <option=value[,...]>', 'specify screenshot options')
            .option('-S, --screenshots-on-fails', 'take a screenshot on test failure')
            .option('-p, --screenshot-path-pattern <pattern>', 'specify the naming schema for screenshot filenames and paths: ${BROWSER}, ${BROWSER_VERSION}, ${OS}, etc.')
            .option('-q, --quarantine-mode [option=value,...]', 'enable and configure quarantine mode')
            .option('-d, --debug-mode', 'enable debug mode. When you run TestCafe in debug mode, it executes test steps one by one, and pauses the test after each step.')
            .option('-e, --skip-js-errors [option=value,...]', 'ignore JavaScript errors that match the specified criteria')
            .option('-u, --skip-uncaught-errors', 'ignore uncaught errors and unhandled promise rejections')
            .option('-t, --test <name>', 'filter tests by name')
            .option('-T, --test-grep <pattern>', 'filter tests by regular expression')
            .option('-f, --fixture <name>', 'filter fixtures by name')
            .option('-F, --fixture-grep <pattern>', 'filter fixtures by regular expression')
            .option('-a, --app <command>', 'execute a shell command on startup to launch a web application or perform other preparatory tasks')
            .option('-c, --concurrency <number>', 'run tests concurrently')
            .option('-L, --live', 'enable live mode. Live mode restarts tests when you make changes to test files.')
            .option('--test-meta <key=value[,key2=value2,...]>', 'filter tests by metadata')
            .option('--fixture-meta <key=value[,key2=value2,...]>', 'filter fixtures by metadata')
            .option('--debug-on-fail', 'pause tests on failure')
            .option('--experimental-proxyless', 'enable proxyless mode: https://testcafe.io/documentation/404237/guides/experimental-capabilities/proxyless-mode')
            .option('--app-init-delay <ms>', 'specify your application`s initialization time')
            .option('--selector-timeout <ms>', 'specify the maximum Selector resolution time')
            .option('--assertion-timeout <ms>', 'specify the maximum Assertion resolution time')
            .option('--page-load-timeout <ms>', 'specify the maximum time between the window.load event and the DOMContentLoaded event (ms)')
            .option('--page-request-timeout <ms>', 'specify the maximum page request resolution time')
            .option('--ajax-request-timeout <ms>', 'specify the maximum AJAX request resolution time')
            .option('--browser-init-timeout <ms>', 'specify the maximum browser startup time')
            .option('--test-execution-timeout <ms>', 'specify the maximum test execution time')
            .option('--run-execution-timeout <ms>', 'specify the maximum test run time')
            .option('--speed <factor>', 'set test execution speed (0.01 ... 1)')
            .option('--ports <port1,port2>', 'specify network ports to use during the test run. The second port is necessary to access cross-domain resources.')
            .option('--hostname <name>', `specify your hostname. Necessary to run tests in remote browsers.`)
            .option('--proxy <host>', 'specify the proxy server hostname or IP address')
            .option('--proxy-bypass <rules>', 'specify URLs that bypass the proxy server')
            .option('--ssl <options>', 'specify SSL options to run TestCafe over HTTPS')
            .option('--video <path>', 'record videos of test runs')
            .option('--video-options <option=value[,...]>', 'specify video recording options')
            .option('--video-encoding-options <option=value[,...]>', 'specify video encoding options')
            .option('--dev', 'log and diagnose TestCafe errors')
            .option('--qr-code', 'output QR codes with URLs for remote browser connections')
            .option('--sf, --stop-on-first-fail', 'stop the test run if any test fails')
            .option('--config-file <path>', 'specify a custom path to the testcafe configuration file')
            .option('--ts-config-path <path>', 'specify the path to a custom TypeScript configuration file')
            .option('--cs, --client-scripts <paths>', 'inject client-side scripts into the page', parseList, [])
            .option('--disable-page-caching', 'do not cache pages')
            .option('--disable-page-reloads', 'do not reload pages between tests')
            .option('--retry-test-pages', 'retry page requests in case of failure')
            .option('--disable-screenshots', 'disable screenshots')
            .option('--screenshots-full-page', 'enable full-page screenshots')
            .option('--compiler-options <option=value[,...]>', 'specify test compilation settings')
            .option('--disable-multiple-windows', 'disable the multi-window mode')
            .option('--disable-http2', 'force the proxy to issue HTTP/1.1 requests')
            .option('--cache', 'cache web assets between test runs')
            .option('--base-url <url>', 'set the base url for the test run')

            // NOTE: these options will be handled by chalk internally
            .option('--color', 'force TestCafe to format CLI output with color')
            .option('--no-color', 'disable text color formatting in the CLI')

            // NOTE: Temporarily exclude experimental options from --help output
            .addOption(new Option('--experimental-debug', 'enable experimental the debug mode').hideHelp())
            .addOption(new Option('--experimental-esm', 'enable experimental the esm mode').hideHelp())
            .addOption(new Option('--disable-cross-domain', 'experimental').hideHelp())
            .action((opts: CommandLineOptions) => {
                this.opts = opts;
            });
    }

    private _patchHelpOutput (defaultSubCommand: Command): void {
        // NOTE: In the future versions of the 'commander' module
        // need to investigate how to remove this hack.
        (program as unknown as Command).outputHelp = function () {
            const storedParent = defaultSubCommand.parent;

            defaultSubCommand.parent = null;

            defaultSubCommand.outputHelp();

            defaultSubCommand.parent = storedParent;
        };
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

    private _parseTestExecutionTimeout (): void {
        if (this.opts.testExecutionTimeout) {
            assertType(is.nonNegativeNumberString, null, 'The test execution timeout', this.opts.testExecutionTimeout);

            this.opts.testExecutionTimeout = parseInt(this.opts.testExecutionTimeout as string, 10);
        }
    }

    private _parseRunExecutionTimeout (): void {
        if (this.opts.runExecutionTimeout) {
            assertType(is.nonNegativeNumberString, null, 'The run execution timeout', this.opts.runExecutionTimeout);

            this.opts.runExecutionTimeout = parseInt(this.opts.runExecutionTimeout as string, 10);
        }
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

    private async _parseSkipJsErrorsOptions (): Promise<void> {
        if (this.opts.skipJsErrors)
            this.opts.skipJsErrors = await getSkipJsErrorsOptions('--skip-js-errors', this.opts.skipJsErrors);
    }

    private _parsePorts (): void {
        if (this.opts.ports) {
            const parsedPorts = (this.opts.ports as string) /* eslint-disable-line no-extra-parens */
                .split(',')
                .map(parsePortNumber);

            if (parsedPorts.length < 2)
                throw new GeneralError(RUNTIME_ERRORS.portsOptionRequiresTwoNumbers);

            this.opts.ports = parsedPorts as number[];
        }
    }

    private _parseBrowsersFromArgs (): void {
        const browsersArg = this.testCafeCommand.args[0] || '';

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
        this.opts.src = this.testCafeCommand.args.slice(1);
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

    private async _parseDashboardOptions (): Promise<void> {
        if (this.opts.dashboardOptions)
            this.opts.dashboardOptions = await getDashboardOptions(this.opts.dashboardOptions as string);
    }

    private _parseListBrowsers (): void {
        const listBrowserOption = this.opts.listBrowsers;

        this.opts.listBrowsers = !!this.opts.listBrowsers;

        if (!this.opts.listBrowsers)
            return;

        this.opts.providerName = typeof listBrowserOption === 'string' ? listBrowserOption : 'locally-installed';
    }

    private static _prepareBooleanOrObjectOption (argv: string[], optionNames: string[], subOptionsNames: string[]): void {
        // NOTE: move options to the end of the array to correctly parse both Boolean and Object type arguments (GH-6231)
        const optionIndex = argv.findIndex(
            el => optionNames.some(opt => el.startsWith(opt)));

        if (optionIndex > -1) {
            const isNotLastOption       = optionIndex < argv.length - 1;
            const shouldMoveOptionToEnd = isNotLastOption &&
                !subOptionsNames.some(opt => argv[optionIndex + 1].startsWith(opt));

            if (shouldMoveOptionToEnd)
                argv.push(argv.splice(optionIndex, 1)[0]);
        }
    }

    public async parse (argv: string[]): Promise<void> {
        CLIArgumentParser._prepareBooleanOrObjectOption(argv, ['-q', '--quarantine-mode'], Object.values(QUARANTINE_OPTION_NAMES));
        CLIArgumentParser._prepareBooleanOrObjectOption(argv, ['-e', '--skip-js-errors'], Object.values(SKIP_JS_ERRORS_OPTIONS_OBJECT_OPTION_NAMES));

        const { args, v8Flags } = extractNodeProcessArguments(argv);

        (program as unknown as Command).parse(args);

        this.args = (program as unknown as Command).args;
        this.opts = Object.assign(this.opts, { v8Flags });

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
        this._parseTestExecutionTimeout();
        this._parseRunExecutionTimeout();
        this._parseAppInitDelay();
        this._parseSpeed();
        this._parsePorts();
        this._parseBrowsersFromArgs();
        this._parseConcurrency();
        this._parseFileList();

        await this._parseFilteringOptions();
        await this._parseQuarantineOptions();
        await this._parseSkipJsErrorsOptions();
        await this._parseScreenshotOptions();
        await this._parseVideoOptions();
        await this._parseCompilerOptions();
        await this._parseSslOptions();
        await this._parseReporters();
        await this._parseDashboardOptions();
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
