'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _path = require('path');

var _commander = require('commander');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

var _isGlob = require('is-glob');

var _isGlob2 = _interopRequireDefault(_isGlob);

var _globby = require('globby');

var _globby2 = _interopRequireDefault(_globby);

var _readFileRelative = require('read-file-relative');

var _runtime = require('../errors/runtime');

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

var _compiler = require('../compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _typeAssertions = require('../errors/runtime/type-assertions');

var _getViewportWidth = require('../utils/get-viewport-width');

var _getViewportWidth2 = _interopRequireDefault(_getViewportWidth);

var _string = require('../utils/string');

var _promisifiedFunctions = require('../utils/promisified-functions');

var _parseSslOptions2 = require('./parse-ssl-options');

var _parseSslOptions3 = _interopRequireDefault(_parseSslOptions2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var REMOTE_ALIAS_RE = /^remote(?::(\d*))?$/;
var DEFAULT_TEST_LOOKUP_DIRS = ['test/', 'tests/'];
var TEST_FILE_GLOB_PATTERN = './**/*@(' + _compiler2.default.getSupportedTestFileExtensions().join('|') + ')';

var DESCRIPTION = (0, _dedent2.default)('\n    In the browser list, you can use browser names (e.g. "ie9", "chrome", etc.) as well as paths to executables.\n\n    To run tests against all installed browsers, use the "all" alias.\n\n    To use a remote browser connection (e.g., to connect a mobile device), specify "remote" as the browser alias.\n    If you need to connect multiple devices, add a colon and the number of browsers you want to connect (e.g., "remote:3").\n\n    To run tests in a browser accessed through a browser provider plugin, specify a browser alias that consists of two parts - the browser provider name prefix and the name of the browser itself; for example, "saucelabs:chrome@51".\n\n    You can use one or more file paths or glob patterns to specify which tests to run.\n\n    More info: https://devexpress.github.io/testcafe/documentation\n');

var CLIArgumentParser = function () {
    function CLIArgumentParser(cwd) {
        (0, _classCallCheck3.default)(this, CLIArgumentParser);

        this.program = new _commander.Command('testcafe');

        this.cwd = cwd || process.cwd();

        this.src = null;
        this.browsers = null;
        this.filter = null;
        this.remoteCount = 0;
        this.opts = null;

        this._describeProgram();
    }

    CLIArgumentParser._isInteger = function _isInteger(value) {
        return !isNaN(value) && isFinite(value);
    };

    CLIArgumentParser._parsePortNumber = function _parsePortNumber(value) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Port number', value);

        return parseInt(value, 10);
    };

    CLIArgumentParser._optionValueToRegExp = function _optionValueToRegExp(name, value) {
        if (value === void 0) return value;

        try {
            return new RegExp(value);
        } catch (err) {
            throw new _runtime.GeneralError(_message2.default.optionValueIsNotValidRegExp, name);
        }
    };

    CLIArgumentParser._getDescription = function _getDescription() {
        // NOTE: add empty line to workaround commander-forced indentation on the first line.
        return '\n' + (0, _string.wordWrap)(DESCRIPTION, 2, (0, _getViewportWidth2.default)(process.stdout));
    };

    CLIArgumentParser.prototype._describeProgram = function _describeProgram() {
        var version = JSON.parse((0, _readFileRelative.readSync)('../../package.json')).version;

        this.program.version(version, '-v, --version').usage('[options] <comma-separated-browser-list> <file-or-glob ...>').description(CLIArgumentParser._getDescription()).option('-b, --list-browsers [provider]', 'output the aliases for local browsers or browsers available through the specified browser provider').option('-r, --reporter <name[:outputFile][,...]>', 'specify the reporters and optionally files where reports are saved').option('-s, --screenshots <path>', 'enable screenshot capturing and specify the path to save the screenshots to').option('-S, --screenshots-on-fails', 'take a screenshot whenever a test fails').option('-q, --quarantine-mode', 'enable the quarantine mode').option('-d, --debug-mode', 'execute test steps one by one pausing the test after each step').option('-e, --skip-js-errors', 'make tests not fail when a JS error happens on a page').option('-t, --test <name>', 'run only tests with the specified name').option('-T, --test-grep <pattern>', 'run only tests matching the specified pattern').option('-f, --fixture <name>', 'run only fixtures with the specified name').option('-F, --fixture-grep <pattern>', 'run only fixtures matching the specified pattern').option('-a, --app <command>', 'launch the tested app using the specified command before running tests').option('-c, --concurrency <number>', 'run tests concurrently').option('--debug-on-fail', 'pause the test if it fails').option('--app-init-delay <ms>', 'specify how much time it takes for the tested app to initialize').option('--selector-timeout <ms>', 'set the amount of time within which selectors make attempts to obtain a node to be returned').option('--assertion-timeout <ms>', 'set the amount of time within which assertion should pass').option('--page-load-timeout <ms>', 'set the amount of time within which TestCafe waits for the `window.load` event to fire on page load before proceeding to the next test action').option('--speed <factor>', 'set the speed of test execution (0.01 ... 1)').option('--ports <port1,port2>', 'specify custom port numbers').option('--hostname <name>', 'specify the hostname').option('--proxy <host>', 'specify the host of the proxy server').option('--ssl', 'specify SSL options to run TestCafe proxy server over the HTTPS protocol').option('--proxy-bypass <rules>', 'specify a comma-separated list of rules that define URLs accessed bypassing the proxy server').option('--disable-page-reloads', 'disable page reloads between tests').option('--qr-code', 'outputs QR-code that repeats URLs used to connect the remote browsers')

        // NOTE: these options will be handled by chalk internally
        .option('--color', 'force colors in command line').option('--no-color', 'disable colors in command line');
    };

    CLIArgumentParser.prototype._filterAndCountRemotes = function _filterAndCountRemotes(browser) {
        var remoteMatch = browser.match(REMOTE_ALIAS_RE);

        if (remoteMatch) {
            this.remoteCount += parseInt(remoteMatch[1], 10) || 1;
            return false;
        }

        return true;
    };

    CLIArgumentParser.prototype._parseFilteringOptions = function _parseFilteringOptions() {
        var _this = this;

        this.opts.testGrep = CLIArgumentParser._optionValueToRegExp('--test-grep', this.opts.testGrep);
        this.opts.fixtureGrep = CLIArgumentParser._optionValueToRegExp('--fixture-grep', this.opts.fixtureGrep);

        this.filter = function (testName, fixtureName) {

            if (_this.opts.test && testName !== _this.opts.test) return false;

            if (_this.opts.testGrep && !_this.opts.testGrep.test(testName)) return false;

            if (_this.opts.fixture && fixtureName !== _this.opts.fixture) return false;

            if (_this.opts.fixtureGrep && !_this.opts.fixtureGrep.test(fixtureName)) return false;

            return true;
        };
    };

    CLIArgumentParser.prototype._parseAppInitDelay = function _parseAppInitDelay() {
        if (this.opts.appInitDelay) {
            (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Tested app initialization delay', this.opts.appInitDelay);

            this.opts.appInitDelay = parseInt(this.opts.appInitDelay, 10);
        }
    };

    CLIArgumentParser.prototype._parseSelectorTimeout = function _parseSelectorTimeout() {
        if (this.opts.selectorTimeout) {
            (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Selector timeout', this.opts.selectorTimeout);

            this.opts.selectorTimeout = parseInt(this.opts.selectorTimeout, 10);
        }
    };

    CLIArgumentParser.prototype._parseAssertionTimeout = function _parseAssertionTimeout() {
        if (this.opts.assertionTimeout) {
            (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Assertion timeout', this.opts.assertionTimeout);

            this.opts.assertionTimeout = parseInt(this.opts.assertionTimeout, 10);
        }
    };

    CLIArgumentParser.prototype._parsePageLoadTimeout = function _parsePageLoadTimeout() {
        if (this.opts.pageLoadTimeout) {
            (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumberString, null, 'Page load timeout', this.opts.pageLoadTimeout);

            this.opts.pageLoadTimeout = parseInt(this.opts.pageLoadTimeout, 10);
        }
    };

    CLIArgumentParser.prototype._parseSpeed = function _parseSpeed() {
        if (this.opts.speed) this.opts.speed = parseFloat(this.opts.speed);
    };

    CLIArgumentParser.prototype._parseConcurrency = function _parseConcurrency() {
        if (this.opts.concurrency) this.concurrency = parseInt(this.opts.concurrency, 10);
    };

    CLIArgumentParser.prototype._parsePorts = function _parsePorts() {
        if (this.opts.ports) {
            this.opts.ports = this.opts.ports.split(',').map(CLIArgumentParser._parsePortNumber);

            if (this.opts.ports.length < 2) throw new _runtime.GeneralError(_message2.default.portsOptionRequiresTwoNumbers);
        }
    };

    CLIArgumentParser.prototype._parseBrowserList = function _parseBrowserList() {
        var _this2 = this;

        var browsersArg = this.program.args[0] || '';

        this.browsers = (0, _string.splitQuotedText)(browsersArg, ',').filter(function (browser) {
            return browser && _this2._filterAndCountRemotes(browser);
        });
    };

    CLIArgumentParser.prototype._parseSslOptions = function _parseSslOptions() {
        if (this.opts.ssl) this.opts.ssl = (0, _parseSslOptions3.default)(this.program.args[0]);
    };

    CLIArgumentParser.prototype._parseReporters = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var reporters, _iterator, _isArray, _i, _ref2, reporter;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (this.opts.reporter) {
                                _context.next = 3;
                                break;
                            }

                            this.opts.reporters = [];
                            return _context.abrupt('return');

                        case 3:
                            reporters = this.opts.reporter.split(',');


                            this.opts.reporters = reporters.map(function (reporter) {
                                var separatorIndex = reporter.indexOf(':');

                                if (separatorIndex < 0) return { name: reporter };

                                var name = reporter.substring(0, separatorIndex);
                                var outFile = reporter.substring(separatorIndex + 1);

                                return { name: name, outFile: outFile };
                            });

                            _iterator = this.opts.reporters, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                        case 6:
                            if (!_isArray) {
                                _context.next = 12;
                                break;
                            }

                            if (!(_i >= _iterator.length)) {
                                _context.next = 9;
                                break;
                            }

                            return _context.abrupt('break', 23);

                        case 9:
                            _ref2 = _iterator[_i++];
                            _context.next = 16;
                            break;

                        case 12:
                            _i = _iterator.next();

                            if (!_i.done) {
                                _context.next = 15;
                                break;
                            }

                            return _context.abrupt('break', 23);

                        case 15:
                            _ref2 = _i.value;

                        case 16:
                            reporter = _ref2;

                            if (!reporter.outFile) {
                                _context.next = 21;
                                break;
                            }

                            reporter.outFile = (0, _path.resolve)(this.cwd, reporter.outFile);

                            _context.next = 21;
                            return (0, _promisifiedFunctions.ensureDir)((0, _path.dirname)(reporter.outFile));

                        case 21:
                            _context.next = 6;
                            break;

                        case 23:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _parseReporters() {
            return _ref.apply(this, arguments);
        }

        return _parseReporters;
    }();

    CLIArgumentParser.prototype._convertDirsToGlobs = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(fileList) {
            var _this3 = this;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return _pinkie2.default.all(fileList.map(function () {
                                var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(file) {
                                    var absPath, fileStat;
                                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                                        while (1) {
                                            switch (_context2.prev = _context2.next) {
                                                case 0:
                                                    if ((0, _isGlob2.default)(file)) {
                                                        _context2.next = 14;
                                                        break;
                                                    }

                                                    absPath = (0, _path.resolve)(_this3.cwd, file);
                                                    fileStat = null;
                                                    _context2.prev = 3;
                                                    _context2.next = 6;
                                                    return (0, _promisifiedFunctions.stat)(absPath);

                                                case 6:
                                                    fileStat = _context2.sent;
                                                    _context2.next = 12;
                                                    break;

                                                case 9:
                                                    _context2.prev = 9;
                                                    _context2.t0 = _context2['catch'](3);
                                                    return _context2.abrupt('return', null);

                                                case 12:
                                                    if (!fileStat.isDirectory()) {
                                                        _context2.next = 14;
                                                        break;
                                                    }

                                                    return _context2.abrupt('return', (0, _path.join)(file, TEST_FILE_GLOB_PATTERN));

                                                case 14:
                                                    return _context2.abrupt('return', file);

                                                case 15:
                                                case 'end':
                                                    return _context2.stop();
                                            }
                                        }
                                    }, _callee2, _this3, [[3, 9]]);
                                }));

                                return function (_x2) {
                                    return _ref4.apply(this, arguments);
                                };
                            }()));

                        case 2:
                            fileList = _context3.sent;
                            return _context3.abrupt('return', fileList.filter(function (file) {
                                return !!file;
                            }));

                        case 4:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function _convertDirsToGlobs(_x) {
            return _ref3.apply(this, arguments);
        }

        return _convertDirsToGlobs;
    }();

    CLIArgumentParser.prototype._getDefaultDirs = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return (0, _globby2.default)(DEFAULT_TEST_LOOKUP_DIRS, {
                                cwd: this.cwd,
                                silent: true,
                                nocase: true
                            });

                        case 2:
                            return _context4.abrupt('return', _context4.sent);

                        case 3:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function _getDefaultDirs() {
            return _ref5.apply(this, arguments);
        }

        return _getDefaultDirs;
    }();

    CLIArgumentParser.prototype._parseFileList = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var _this4 = this;

            var fileList;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            fileList = this.program.args.slice(1);

                            if (fileList.length) {
                                _context5.next = 5;
                                break;
                            }

                            _context5.next = 4;
                            return this._getDefaultDirs();

                        case 4:
                            fileList = _context5.sent;

                        case 5:
                            _context5.next = 7;
                            return this._convertDirsToGlobs(fileList);

                        case 7:
                            fileList = _context5.sent;
                            _context5.next = 10;
                            return (0, _globby2.default)(fileList, {
                                cwd: this.cwd,
                                silent: true,
                                nodir: true
                            });

                        case 10:
                            this.src = _context5.sent;


                            this.src = this.src.map(function (file) {
                                return (0, _path.resolve)(_this4.cwd, file);
                            });

                        case 12:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function _parseFileList() {
            return _ref6.apply(this, arguments);
        }

        return _parseFileList;
    }();

    CLIArgumentParser.prototype._parseScreenshotsPath = function () {
        var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            if (!this.opts.screenshots) {
                                _context6.next = 4;
                                break;
                            }

                            this.opts.screenshots = (0, _path.resolve)(this.cwd, this.opts.screenshots);

                            _context6.next = 4;
                            return (0, _promisifiedFunctions.ensureDir)(this.opts.screenshots);

                        case 4:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function _parseScreenshotsPath() {
            return _ref7.apply(this, arguments);
        }

        return _parseScreenshotsPath;
    }();

    CLIArgumentParser.prototype._getProviderName = function _getProviderName() {
        this.opts.providerName = this.opts.listBrowsers === true ? void 0 : this.opts.listBrowsers;
    };

    CLIArgumentParser.prototype.parse = function () {
        var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(argv) {
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            this.program.parse(argv);

                            this.opts = this.program.opts();

                            // NOTE: the '-list-browsers' option only lists browsers and immediately exits the app.
                            // Therefore, we don't need to process other arguments.

                            if (!this.opts.listBrowsers) {
                                _context7.next = 5;
                                break;
                            }

                            this._getProviderName();
                            return _context7.abrupt('return');

                        case 5:

                            this._parseFilteringOptions();
                            this._parseSelectorTimeout();
                            this._parseAssertionTimeout();
                            this._parsePageLoadTimeout();
                            this._parseAppInitDelay();
                            this._parseSpeed();
                            this._parsePorts();
                            this._parseBrowserList();
                            this._parseConcurrency();
                            this._parseSslOptions();

                            _context7.next = 17;
                            return _pinkie2.default.all([this._parseScreenshotsPath(), this._parseFileList(), this._parseReporters()]);

                        case 17:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function parse(_x3) {
            return _ref8.apply(this, arguments);
        }

        return parse;
    }();

    return CLIArgumentParser;
}();

exports.default = CLIArgumentParser;
module.exports = exports['default'];