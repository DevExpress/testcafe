'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _readFileRelative = require('read-file-relative');

var _testcafeHammerhead = require('testcafe-hammerhead');

var _testcafeLegacyApi = require('testcafe-legacy-api');

var _gateway = require('./browser/connection/gateway');

var _gateway2 = _interopRequireDefault(_gateway);

var _connection = require('./browser/connection');

var _connection2 = _interopRequireDefault(_connection);

var _pool = require('./browser/provider/pool');

var _pool2 = _interopRequireDefault(_pool);

var _runner = require('./runner');

var _runner2 = _interopRequireDefault(_runner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Const
var CORE_SCRIPT = (0, _readFileRelative.readSync)('./client/core/index.js');
var DRIVER_SCRIPT = (0, _readFileRelative.readSync)('./client/driver/index.js');
var UI_SCRIPT = (0, _readFileRelative.readSync)('./client/ui/index.js');
var AUTOMATION_SCRIPT = (0, _readFileRelative.readSync)('./client/automation/index.js');
var UI_STYLE = (0, _readFileRelative.readSync)('./client/ui/styles.css');
var UI_SPRITE = (0, _readFileRelative.readSync)('./client/ui/sprite.png', true);
var FAVICON = (0, _readFileRelative.readSync)('./client/ui/favicon.ico', true);

var TestCafe = function () {
    function TestCafe(hostname, port1, port2, sslOptions) {
        (0, _classCallCheck3.default)(this, TestCafe);

        this.closed = false;
        this.proxy = new _testcafeHammerhead.Proxy(hostname, port1, port2, sslOptions);
        this.browserConnectionGateway = new _gateway2.default(this.proxy);
        this.runners = [];

        this._registerAssets();
    }

    TestCafe.prototype._registerAssets = function _registerAssets() {
        this.proxy.GET('/testcafe-core.js', { content: CORE_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-driver.js', { content: DRIVER_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-legacy-runner.js', {
            content: _testcafeLegacyApi.CLIENT_RUNNER_SCRIPT,
            contentType: 'application/x-javascript'
        });
        this.proxy.GET('/testcafe-automation.js', { content: AUTOMATION_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui.js', { content: UI_SCRIPT, contentType: 'application/x-javascript' });
        this.proxy.GET('/testcafe-ui-sprite.png', { content: UI_SPRITE, contentType: 'image/png' });
        this.proxy.GET('/favicon.ico', { content: FAVICON, contentType: 'image/x-icon' });

        this.proxy.GET('/testcafe-ui-styles.css', {
            content: UI_STYLE,
            contentType: 'text/css',
            isShadowUIStylesheet: true
        });
    };

    // API


    TestCafe.prototype.createBrowserConnection = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var browserInfo;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return _pool2.default.getBrowserInfo('remote');

                        case 2:
                            browserInfo = _context.sent;
                            return _context.abrupt('return', new _connection2.default(this.browserConnectionGateway, browserInfo, true));

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function createBrowserConnection() {
            return _ref.apply(this, arguments);
        }

        return createBrowserConnection;
    }();

    TestCafe.prototype.createRunner = function createRunner() {
        var newRunner = new _runner2.default(this.proxy, this.browserConnectionGateway);

        this.runners.push(newRunner);

        return newRunner;
    };

    TestCafe.prototype.close = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!this.closed) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return');

                        case 2:

                            this.closed = true;

                            _context2.next = 5;
                            return _pinkie2.default.all(this.runners.map(function (runner) {
                                return runner.stop();
                            }));

                        case 5:
                            _context2.next = 7;
                            return _pool2.default.dispose();

                        case 7:

                            this.browserConnectionGateway.close();
                            this.proxy.close();

                        case 9:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function close() {
            return _ref2.apply(this, arguments);
        }

        return close;
    }();

    return TestCafe;
}();

exports.default = TestCafe;
module.exports = exports['default'];