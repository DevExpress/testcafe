import { resolve } from 'path';
import { Command } from 'commander';
import { Promise } from 'es6-promise';
import promisify from 'es6-promisify';
import dedent from 'dedent';
import globby from 'globby';
import mkdirp from 'mkdirp';
import { getInstallations as getBrowserInstallations } from 'testcafe-browser-natives';
import { readSync as read } from 'read-file-relative';
import { MESSAGE, getText } from '../messages';
import getViewPortWidth from '../utils/get-viewport-width';
import wordWrap from '../utils/word-wrap';

var ensureDir = promisify(mkdirp);

const REMOTE_ALIAS_RE = /^(\d*)remote$/;

const DESCRIPTION = dedent`
    In the browser list, you can use aliases (e.g. "ie9", "chrome", etc.) as well as paths to executables.

    To run tests against all installed browsers, use the "all" alias.

    To use a remote browser connection (e.g. to connect a mobile device), specify "remote" as a browser alias. If you
    need to connect multiple devices, prefix the alias with the number of browsers you want to connect (e.g., "3remote").

    You can use one or more file paths or glob patterns to specify which tests to run.

    More info: http://testcafe.devexpress.com/Documentation/CLI
`;

export default class CliArgumentParser {
    constructor () {
        this.program = new Command('testcafe');

        this.cwd = process.cwd();

        this.src             = null;
        this.browsers        = null;
        this.filter          = null;
        this.remoteCount     = 0;
        this.opts            = null;

        this._describeProgram();
    }

    static _parsePortNumber (value) {
        var number = parseInt(value, 10);

        if (isNaN(value))
            throw new Error(getText(MESSAGE.portNumberIsNotInteger));

        return number;
    }

    static _optionValueToRegExp (name, value) {
        if (value === void 0)
            return value;

        try {
            return new RegExp(value);
        }
        catch (err) {
            throw new Error(getText(MESSAGE.optionValueIsNotValidRegExp, name));
        }
    }

    static _replaceAllBrowsersAlias (browserList, browser, allAliases) {
        if (browser === 'all')
            browserList = browserList.concat(allAliases);

        else
            browserList.push(browser);

        return browserList;
    }

    static _getDescription () {
        // NOTE: add empty line to workaround commander-forced indentation on the first line.
        return '\n' + wordWrap(DESCRIPTION, 2, getViewPortWidth(process.stdout));
    }

    _describeProgram () {
        this.program

            .version(JSON.parse(read('../../package.json')).version)
            .usage('[options] <comma-separated-browser-list> <file-or-glob ...>')
            .description(CliArgumentParser._getDescription())

            .option('-b, --list-browsers', 'output the available browser aliases')
            .option('-r, --reporter <name>', 'specify the reporter type to use')
            .option('-s, --screenshots <path>', 'enable screenshot capturing and specify the path to save the screenshots to')
            .option('-S, --screenshots-on-fails', 'take a screenshot whenever a test fails')
            .option('-q, --quarantine-mode', 'enable the quarantine mode')
            .option('-e, --skip-js-errors', 'make tests not fail when a JS error happens on a page')
            .option('-t, --test <name>', 'run only tests with the specified name')
            .option('-T, --test-grep <pattern>', 'run only tests matching the specified pattern')
            .option('-f, --fixture <name>', 'run only fixtures with the specified name')
            .option('-F, --fixture-grep <pattern>', 'run only fixtures matching the specified pattern')
            .option('--ports <port1,port2>', 'specify custom port numbers')
            .option('--hostname <name>', 'specify the hostname')
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
        this.opts.testGrep    = CliArgumentParser._optionValueToRegExp('--test-grep', this.opts.testGrep);
        this.opts.fixtureGrep = CliArgumentParser._optionValueToRegExp('--fixture-grep', this.opts.fixtureGrep);

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

    async _parsePorts () {
        if (this.opts.ports) {
            this.opts.ports = this.opts.ports
                .split(',')
                .map(CliArgumentParser._parsePortNumber);

            if (this.opts.ports.length < 2)
                throw new Error(getText(MESSAGE.portsOptionRequiresTwoNumbers));
        }
    }

    async _parseBrowserList () {
        var browsersArg   = this.program.args[0] || '';
        var installations = await getBrowserInstallations();
        var allAliases    = Object.keys(installations);

        this.browsers = browsersArg
            .split(',')
            .filter(browser => browser && this._filterAndCountRemotes(browser))
            .reduce((browserList, browser) => CliArgumentParser._replaceAllBrowsersAlias(browserList, browser, allAliases), []);
    }

    async _parseFileList () {
        var fileList = this.program.args.slice(1);

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

    async parse (argv) {
        this.program.parse(argv);

        this.opts = this.program.opts();

        // NOTE: the '-list-browsers' option only lists browsers and immediately exits the app.
        // Therefore, we don't need to process other arguments.
        if (!this.opts.listBrowsers) {
            this._parseFilteringOptions();

            await Promise.all([
                this._parsePorts(),
                this._parseScreenshotsPath(),
                this._parseBrowserList(),
                this._parseFileList()
            ]);
        }
    }
}

