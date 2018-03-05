import { resolve, join as pathJoin, dirname } from 'path';
import { Command } from 'commander';
import Promise from 'pinkie';
import dedent from 'dedent';
import isGlob from 'is-glob';
import globby from 'globby';
import { readSync as read } from 'read-file-relative';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';
import Compiler from '../compiler';
import { assertType, is } from '../errors/runtime/type-assertions';
import getViewPortWidth from '../utils/get-viewport-width';
import { wordWrap, splitQuotedText } from '../utils/string';
import { stat, ensureDir } from '../utils/promisified-functions';


const REMOTE_ALIAS_RE          = /^remote(?::(\d*))?$/;
const DEFAULT_TEST_LOOKUP_DIRS = ['test/', 'tests/'];
const TEST_FILE_GLOB_PATTERN   = `./**/*@(${Compiler.getSupportedTestFileExtensions().join('|')})`;

const DESCRIPTION = dedent(`
    In the browser list, you can use browser names (e.g. "ie9", "chrome", etc.) as well as paths to executables.

    To run tests against all installed browsers, use the "all" alias.

    To use a remote browser connection (e.g., to connect a mobile device), specify "remote" as the browser alias.
    If you need to connect multiple devices, add a colon and the number of browsers you want to connect (e.g., "remote:3").

    To run tests in a browser accessed through a browser provider plugin, specify a browser alias that consists of two parts - the browser provider name prefix and the name of the browser itself; for example, "saucelabs:chrome@51".

    You can use one or more file paths or glob patterns to specify which tests to run.

    More info: https://devexpress.github.io/testcafe/documentation
`);


export default class CLIArgumentParser {
    constructor (cwd) {
        this.program = new Command('testcafe');

        this.cwd = cwd || process.cwd();

        this.src         = null;
        this.browsers    = null;
        this.filter      = null;
        this.remoteCount = 0;
        this.opts        = null;

        this._describeProgram();
    }

    static _isInteger (value) {
        return !isNaN(value) && isFinite(value);
    }

    static _parsePortNumber (value) {
        assertType(is.nonNegativeNumberString, null, 'Port number', value);

        return parseInt(value, 10);
    }

    static _optionValueToRegExp (name, value) {
        if (value === void 0)
            return value;

        try {
            return new RegExp(value);
        }
        catch (err) {
            throw new GeneralError(MESSAGE.optionValueIsNotValidRegExp, name);
        }
    }

    static _getDescription () {
        // NOTE: add empty line to workaround commander-forced indentation on the first line.
        return '\n' + wordWrap(DESCRIPTION, 2, getViewPortWidth(process.stdout));
    }

    _describeProgram () {
        var version = JSON.parse(read('../../package.json')).version;

        this.program

            .version(version, '-v, --version')
            .usage('[options] <comma-separated-browser-list> <file-or-glob ...>')
            .description(CLIArgumentParser._getDescription())

            .option('-b, --list-browsers [provider]', 'output the aliases for local browsers or browsers available through the specified browser provider')
            .option('-r, --reporter <name[:outputFile][,...]>', 'specify the reporters and optionally files where reports are saved')
            .option('-s, --screenshots <path>', 'enable screenshot capturing and specify the path to save the screenshots to')
            .option('-S, --screenshots-on-fails', 'take a screenshot whenever a test fails')
            .option('-q, --quarantine-mode', 'enable the quarantine mode')
            .option('-d, --debug-mode', 'execute test steps one by one pausing the test after each step')
            .option('-e, --skip-js-errors', 'make tests not fail when a JS error happens on a page')
            .option('-t, --test <name>', 'run only tests with the specified name')
            .option('-T, --test-grep <pattern>', 'run only tests matching the specified pattern')
            .option('-f, --fixture <name>', 'run only fixtures with the specified name')
            .option('-F, --fixture-grep <pattern>', 'run only fixtures matching the specified pattern')
            .option('-a, --app <command>', 'launch the tested app using the specified command before running tests')
            .option('-c, --concurrency <number>', 'run tests concurrently')
            .option('--debug-on-fail', 'pause the test if it fails')
            .option('--app-init-delay <ms>', 'specify how much time it takes for the tested app to initialize')
            .option('--selector-timeout <ms>', 'set the amount of time within which selectors make attempts to obtain a node to be returned')
            .option('--assertion-timeout <ms>', 'set the amount of time within which assertion should pass')
            .option('--page-load-timeout <ms>', 'set the amount of time within which TestCafe waits for the `window.load` event to fire on page load before proceeding to the next test action')
            .option('--speed <factor>', 'set the speed of test execution (0.01 ... 1)')
            .option('--ports <port1,port2>', 'specify custom port numbers')
            .option('--hostname <name>', 'specify the hostname')
            .option('--proxy <host>', 'specify the host of the proxy server')
            .option('--proxy-bypass <rules>', 'specify a comma-separated list of rules that define URLs accessed bypassing the proxy server')
            .option('--qr-code', 'outputs QR-code that repeats URLs used to connect the remote browsers')

            // NOTE: these options will be handled by chalk internally
            .option('--color', 'force colors in command line')
            .option('--no-color', 'disable colors in command line');
    }

    _filterAndCountRemotes (browser) {
        var remoteMatch = browser.match(REMOTE_ALIAS_RE);

        if (remoteMatch) {
            this.remoteCount += parseInt(remoteMatch[1], 10) || 1;
            return false;
        }

        return true;
    }

    _parseFilteringOptions () {
        this.opts.testGrep    = CLIArgumentParser._optionValueToRegExp('--test-grep', this.opts.testGrep);
        this.opts.fixtureGrep = CLIArgumentParser._optionValueToRegExp('--fixture-grep', this.opts.fixtureGrep);

        this.filter = (testName, fixtureName) => {

            if (this.opts.test && testName !== this.opts.test)
                return false;

            if (this.opts.testGrep && !this.opts.testGrep.test(testName))
                return false;

            if (this.opts.fixture && fixtureName !== this.opts.fixture)
                return false;

            if (this.opts.fixtureGrep && !this.opts.fixtureGrep.test(fixtureName))
                return false;

            return true;
        };
    }

    _parseAppInitDelay () {
        if (this.opts.appInitDelay) {
            assertType(is.nonNegativeNumberString, null, 'Tested app initialization delay', this.opts.appInitDelay);

            this.opts.appInitDelay = parseInt(this.opts.appInitDelay, 10);
        }
    }


    _parseSelectorTimeout () {
        if (this.opts.selectorTimeout) {
            assertType(is.nonNegativeNumberString, null, 'Selector timeout', this.opts.selectorTimeout);

            this.opts.selectorTimeout = parseInt(this.opts.selectorTimeout, 10);
        }
    }

    _parseAssertionTimeout () {
        if (this.opts.assertionTimeout) {
            assertType(is.nonNegativeNumberString, null, 'Assertion timeout', this.opts.assertionTimeout);

            this.opts.assertionTimeout = parseInt(this.opts.assertionTimeout, 10);
        }
    }

    _parsePageLoadTimeout () {
        if (this.opts.pageLoadTimeout) {
            assertType(is.nonNegativeNumberString, null, 'Page load timeout', this.opts.pageLoadTimeout);

            this.opts.pageLoadTimeout = parseInt(this.opts.pageLoadTimeout, 10);
        }
    }

    _parseSpeed () {
        if (this.opts.speed)
            this.opts.speed = parseFloat(this.opts.speed);
    }

    _parseConcurrency () {
        if (this.opts.concurrency)
            this.concurrency = parseInt(this.opts.concurrency, 10);
    }

    _parsePorts () {
        if (this.opts.ports) {
            this.opts.ports = this.opts.ports
                .split(',')
                .map(CLIArgumentParser._parsePortNumber);

            if (this.opts.ports.length < 2)
                throw new GeneralError(MESSAGE.portsOptionRequiresTwoNumbers);
        }
    }

    _parseBrowserList () {
        var browsersArg = this.program.args[0] || '';

        this.browsers = splitQuotedText(browsersArg, ',')
            .filter(browser => browser && this._filterAndCountRemotes(browser));
    }

    async _parseReporters () {
        if (!this.opts.reporter) {
            this.opts.reporters = [];
            return;
        }

        const reporters = this.opts.reporter.split(',');

        this.opts.reporters = reporters.map(reporter => {
            const separatorIndex = reporter.indexOf(':');

            if (separatorIndex < 0)
                return { name: reporter };

            const name    = reporter.substring(0, separatorIndex);
            const outFile = reporter.substring(separatorIndex + 1);

            return { name, outFile };
        });

        for (const reporter of this.opts.reporters) {
            if (reporter.outFile) {
                reporter.outFile = resolve(this.cwd, reporter.outFile);

                await ensureDir(dirname(reporter.outFile));
            }
        }
    }

    async _convertDirsToGlobs (fileList) {
        fileList = await Promise.all(fileList.map(async file => {
            if (!isGlob(file)) {
                var absPath  = resolve(this.cwd, file);
                var fileStat = null;

                try {
                    fileStat = await stat(absPath);
                }
                catch (err) {
                    return null;
                }

                if (fileStat.isDirectory())
                    return pathJoin(file, TEST_FILE_GLOB_PATTERN);
            }

            return file;
        }));

        return fileList.filter(file => !!file);
    }

    async _getDefaultDirs () {
        return await globby(DEFAULT_TEST_LOOKUP_DIRS, {
            cwd:    this.cwd,
            silent: true,
            nocase: true
        });
    }

    async _parseFileList () {
        var fileList = this.program.args.slice(1);

        if (!fileList.length)
            fileList = await this._getDefaultDirs();

        fileList = await this._convertDirsToGlobs(fileList);

        this.src = await globby(fileList, {
            cwd:    this.cwd,
            silent: true,
            nodir:  true
        });

        this.src = this.src.map(file => resolve(this.cwd, file));
    }

    async _parseScreenshotsPath () {
        if (this.opts.screenshots) {
            this.opts.screenshots = resolve(this.cwd, this.opts.screenshots);

            await ensureDir(this.opts.screenshots);
        }
    }

    _getProviderName () {
        this.opts.providerName = this.opts.listBrowsers === true ? void 0 : this.opts.listBrowsers;
    }

    async parse (argv) {
        this.program.parse(argv);

        this.opts = this.program.opts();

        // NOTE: the '-list-browsers' option only lists browsers and immediately exits the app.
        // Therefore, we don't need to process other arguments.
        if (this.opts.listBrowsers) {
            this._getProviderName();
            return;
        }

        this._parseFilteringOptions();
        this._parseSelectorTimeout();
        this._parseAssertionTimeout();
        this._parsePageLoadTimeout();
        this._parseAppInitDelay();
        this._parseSpeed();
        this._parsePorts();
        this._parseBrowserList();
        this._parseConcurrency();

        await Promise.all([
            this._parseScreenshotsPath(),
            this._parseFileList(),
            this._parseReporters()
        ]);
    }
}
