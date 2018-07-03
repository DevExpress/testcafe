'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _mustache = require('mustache');

var _mustache2 = _interopRequireDefault(_mustache);

var _lodash = require('lodash');

var _useragent = require('useragent');

var _readFileRelative = require('read-file-relative');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _nanoid = require('nanoid');

var _nanoid2 = _interopRequireDefault(_nanoid);

var _command = require('./command');

var _command2 = _interopRequireDefault(_command);

var _status = require('./status');

var _status2 = _interopRequireDefault(_status);

var _runtime = require('../../errors/runtime');

var _message = require('../../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Const
var IDLE_PAGE_TEMPLATE = (0, _readFileRelative.readSync)('../../client/browser/idle-page/index.html.mustache');

var connections = {};

var BrowserConnection = function (_EventEmitter) {
    (0, _inherits3.default)(BrowserConnection, _EventEmitter);

    function BrowserConnection(gateway, browserInfo, permanent) {
        (0, _classCallCheck3.default)(this, BrowserConnection);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.HEARTBEAT_TIMEOUT = 2 * 60 * 1000;

        _this.id = BrowserConnection._generateId();
        _this.jobQueue = [];
        _this.initScriptsQueue = [];
        _this.browserConnectionGateway = gateway;

        _this.browserInfo = browserInfo;
        _this.browserInfo.userAgent = '';
        _this.browserInfo.userAgentProviderMetaInfo = '';

        _this.provider = browserInfo.provider;

        _this.permanent = permanent;
        _this.closing = false;
        _this.closed = false;
        _this.ready = false;
        _this.opened = false;
        _this.idle = true;
        _this.heartbeatTimeout = null;
        _this.pendingTestRunUrl = null;

        _this.url = gateway.domain + '/browser/connect/' + _this.id;
        _this.idleUrl = gateway.domain + '/browser/idle/' + _this.id;
        _this.forcedIdleUrl = gateway.domain + '/browser/idle-forced/' + _this.id;
        _this.initScriptUrl = gateway.domain + '/browser/init-script/' + _this.id;

        _this.heartbeatRelativeUrl = '/browser/heartbeat/' + _this.id;
        _this.statusRelativeUrl = '/browser/status/' + _this.id;
        _this.statusDoneRelativeUrl = '/browser/status-done/' + _this.id;

        _this.heartbeatUrl = '' + gateway.domain + _this.heartbeatRelativeUrl;
        _this.statusUrl = '' + gateway.domain + _this.statusRelativeUrl;
        _this.statusDoneUrl = '' + gateway.domain + _this.statusDoneRelativeUrl;

        _this.on('error', function () {
            _this._forceIdle();
            _this.close();
        });

        connections[_this.id] = _this;

        _this.browserConnectionGateway.startServingConnection(_this);

        _this._runBrowser();
        return _this;
    }

    BrowserConnection._generateId = function _generateId() {
        return (0, _nanoid2.default)(7);
    };

    BrowserConnection.prototype._runBrowser = function _runBrowser() {
        var _this2 = this;

        // NOTE: Give caller time to assign event listeners
        process.nextTick((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _context.next = 3;
                            return _this2.provider.openBrowser(_this2.id, _this2.url, _this2.browserInfo.browserName);

                        case 3:
                            if (_this2.ready) {
                                _context.next = 6;
                                break;
                            }

                            _context.next = 6;
                            return (0, _promisifyEvent2.default)(_this2, 'ready');

                        case 6:

                            _this2.opened = true;
                            _this2.emit('opened');
                            _context.next = 13;
                            break;

                        case 10:
                            _context.prev = 10;
                            _context.t0 = _context['catch'](0);

                            _this2.emit('error', new _runtime.GeneralError(_message2.default.unableToOpenBrowser, _this2.browserInfo.providerName + ':' + _this2.browserInfo.browserName, _context.t0.stack));

                        case 13:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this2, [[0, 10]]);
        })));
    };

    BrowserConnection.prototype._closeBrowser = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (this.idle) {
                                _context2.next = 3;
                                break;
                            }

                            _context2.next = 3;
                            return (0, _promisifyEvent2.default)(this, 'idle');

                        case 3:
                            _context2.prev = 3;
                            _context2.next = 6;
                            return this.provider.closeBrowser(this.id);

                        case 6:
                            _context2.next = 10;
                            break;

                        case 8:
                            _context2.prev = 8;
                            _context2.t0 = _context2['catch'](3);

                        case 10:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[3, 8]]);
        }));

        function _closeBrowser() {
            return _ref2.apply(this, arguments);
        }

        return _closeBrowser;
    }();

    BrowserConnection.prototype._forceIdle = function _forceIdle() {
        if (!this.idle) {
            this.switchingToIdle = false;
            this.idle = true;
            this.emit('idle');
        }
    };

    BrowserConnection.prototype._waitForHeartbeat = function _waitForHeartbeat() {
        var _this3 = this;

        this.heartbeatTimeout = setTimeout(function () {
            _this3.emit('error', new _runtime.GeneralError(_message2.default.browserDisconnected, _this3.userAgent));
        }, this.HEARTBEAT_TIMEOUT);
    };

    BrowserConnection.prototype._getTestRunUrl = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(isTestDone) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(isTestDone || !this.pendingTestRunUrl)) {
                                _context3.next = 4;
                                break;
                            }

                            _context3.next = 3;
                            return this._popNextTestRunUrl();

                        case 3:
                            this.pendingTestRunUrl = _context3.sent;

                        case 4:
                            return _context3.abrupt('return', this.pendingTestRunUrl);

                        case 5:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function _getTestRunUrl(_x) {
            return _ref3.apply(this, arguments);
        }

        return _getTestRunUrl;
    }();

    BrowserConnection.prototype._popNextTestRunUrl = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            while (this.hasQueuedJobs && !this.currentJob.hasQueuedTestRuns) {
                                this.jobQueue.shift();
                            }
                            if (!this.hasQueuedJobs) {
                                _context4.next = 7;
                                break;
                            }

                            _context4.next = 4;
                            return this.currentJob.popNextTestRunUrl(this);

                        case 4:
                            _context4.t0 = _context4.sent;
                            _context4.next = 8;
                            break;

                        case 7:
                            _context4.t0 = null;

                        case 8:
                            return _context4.abrupt('return', _context4.t0);

                        case 9:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function _popNextTestRunUrl() {
            return _ref4.apply(this, arguments);
        }

        return _popNextTestRunUrl;
    }();

    BrowserConnection.getById = function getById(id) {
        return connections[id] || null;
    };

    BrowserConnection.prototype.addWarning = function addWarning() {
        var _currentJob$warningLo;

        if (this.currentJob) (_currentJob$warningLo = this.currentJob.warningLog).addWarning.apply(_currentJob$warningLo, arguments);
    };

    BrowserConnection.prototype.setProviderMetaInfo = function setProviderMetaInfo(str) {
        this.browserInfo.userAgentProviderMetaInfo = str;
    };

    // API
    BrowserConnection.prototype.runInitScript = function runInitScript(code) {
        var _this4 = this;

        return new _pinkie2.default(function (resolve) {
            return _this4.initScriptsQueue.push({ code: code, resolve: resolve });
        });
    };

    BrowserConnection.prototype.addJob = function addJob(job) {
        this.jobQueue.push(job);
    };

    BrowserConnection.prototype.removeJob = function removeJob(job) {
        (0, _lodash.pull)(this.jobQueue, job);
    };

    BrowserConnection.prototype.close = function close() {
        var _this5 = this;

        if (this.closed || this.closing) return;

        this.closing = true;

        this._closeBrowser().then(function () {
            _this5.browserConnectionGateway.stopServingConnection(_this5);
            clearTimeout(_this5.heartbeatTimeout);

            delete connections[_this5.id];

            _this5.ready = false;
            _this5.closed = true;

            _this5.emit('closed');
        });
    };

    BrowserConnection.prototype.establish = function establish(userAgent) {
        this.ready = true;

        this.browserInfo.userAgent = (0, _useragent.parse)(userAgent).toString();

        this._waitForHeartbeat();
        this.emit('ready');
    };

    BrowserConnection.prototype.heartbeat = function heartbeat() {
        clearTimeout(this.heartbeatTimeout);
        this._waitForHeartbeat();

        return {
            code: this.closing ? _status2.default.closing : _status2.default.ok,
            url: this.closing ? this.idleUrl : ''
        };
    };

    BrowserConnection.prototype.renderIdlePage = function renderIdlePage() {
        return _mustache2.default.render(IDLE_PAGE_TEMPLATE, {
            userAgent: this.userAgent,
            statusUrl: this.statusUrl,
            heartbeatUrl: this.heartbeatUrl,
            initScriptUrl: this.initScriptUrl
        });
    };

    BrowserConnection.prototype.getInitScript = function getInitScript() {
        var initScriptPromise = this.initScriptsQueue[0];

        return { code: initScriptPromise ? initScriptPromise.code : null };
    };

    BrowserConnection.prototype.handleInitScriptResult = function handleInitScriptResult(data) {
        var initScriptPromise = this.initScriptsQueue.shift();

        if (initScriptPromise) initScriptPromise.resolve(JSON.parse(data));
    };

    BrowserConnection.prototype.reportJobResult = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(status, data) {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return this.provider.reportJobResult(this.id, status, data);

                        case 2:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function reportJobResult(_x2, _x3) {
            return _ref5.apply(this, arguments);
        }

        return reportJobResult;
    }();

    BrowserConnection.prototype.getStatus = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(isTestDone) {
            var testRunUrl;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            if (!this.idle && !isTestDone) {
                                this.idle = true;
                                this.emit('idle');
                            }

                            if (!this.opened) {
                                _context6.next = 8;
                                break;
                            }

                            _context6.next = 4;
                            return this._getTestRunUrl(isTestDone);

                        case 4:
                            testRunUrl = _context6.sent;

                            if (!testRunUrl) {
                                _context6.next = 8;
                                break;
                            }

                            this.idle = false;
                            return _context6.abrupt('return', { cmd: _command2.default.run, url: testRunUrl });

                        case 8:
                            return _context6.abrupt('return', { cmd: _command2.default.idle, url: this.idleUrl });

                        case 9:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function getStatus(_x4) {
            return _ref6.apply(this, arguments);
        }

        return getStatus;
    }();

    (0, _createClass3.default)(BrowserConnection, [{
        key: 'userAgent',
        get: function get() {
            var userAgent = this.browserInfo.userAgent;

            if (this.browserInfo.userAgentProviderMetaInfo) userAgent += ' (' + this.browserInfo.userAgentProviderMetaInfo + ')';

            return userAgent;
        }
    }, {
        key: 'hasQueuedJobs',
        get: function get() {
            return !!this.jobQueue.length;
        }
    }, {
        key: 'currentJob',
        get: function get() {
            return this.jobQueue[0];
        }
    }]);
    return BrowserConnection;
}(_events.EventEmitter);

exports.default = BrowserConnection;
module.exports = exports['default'];