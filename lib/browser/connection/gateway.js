'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _readFileRelative = require('read-file-relative');

var _http = require('../../utils/http');

var _remotesQueue = require('./remotes-queue');

var _remotesQueue2 = _interopRequireDefault(_remotesQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Const
var IDLE_PAGE_SCRIPT = (0, _readFileRelative.readSync)('../../client/browser/idle-page/index.js');
var IDLE_PAGE_STYLE = (0, _readFileRelative.readSync)('../../client/browser/idle-page/styles.css');
var IDLE_PAGE_LOGO = (0, _readFileRelative.readSync)('../../client/browser/idle-page/logo.svg', true);

// Gateway

var BrowserConnectionGateway = function () {
    function BrowserConnectionGateway(proxy) {
        (0, _classCallCheck3.default)(this, BrowserConnectionGateway);

        this.connections = {};
        this.remotesQueue = new _remotesQueue2.default();
        this.domain = proxy.server1Info.domain;

        this.connectUrl = this.domain + '/browser/connect';

        this._registerRoutes(proxy);
    }

    BrowserConnectionGateway.prototype._dispatch = function _dispatch(url, proxy, handler) {
        var _this = this;

        var method = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'GET';

        proxy[method](url, function (req, res, si, params) {
            var connection = _this.connections[params.id];

            (0, _http.preventCaching)(res);

            if (connection) handler(req, res, connection);else (0, _http.respond404)(res);
        });
    };

    BrowserConnectionGateway.prototype._registerRoutes = function _registerRoutes(proxy) {
        var _this2 = this;

        this._dispatch('/browser/connect/{id}', proxy, BrowserConnectionGateway.onConnection);
        this._dispatch('/browser/heartbeat/{id}', proxy, BrowserConnectionGateway.onHeartbeat);
        this._dispatch('/browser/idle/{id}', proxy, BrowserConnectionGateway.onIdle);
        this._dispatch('/browser/idle-forced/{id}', proxy, BrowserConnectionGateway.onIdleForced);
        this._dispatch('/browser/status/{id}', proxy, BrowserConnectionGateway.onStatusRequest);
        this._dispatch('/browser/status-done/{id}', proxy, BrowserConnectionGateway.onStatusRequestOnTestDone);
        this._dispatch('/browser/init-script/{id}', proxy, BrowserConnectionGateway.onInitScriptRequest);
        this._dispatch('/browser/init-script/{id}', proxy, BrowserConnectionGateway.onInitScriptResponse, 'POST');

        proxy.GET('/browser/connect', function (req, res) {
            return _this2._connectNextRemoteBrowser(req, res);
        });
        proxy.GET('/browser/connect/', function (req, res) {
            return _this2._connectNextRemoteBrowser(req, res);
        });

        proxy.GET('/browser/assets/index.js', { content: IDLE_PAGE_SCRIPT, contentType: 'application/x-javascript' });
        proxy.GET('/browser/assets/styles.css', { content: IDLE_PAGE_STYLE, contentType: 'text/css' });
        proxy.GET('/browser/assets/logo.svg', { content: IDLE_PAGE_LOGO, contentType: 'image/svg+xml' });
    };

    // Helpers


    BrowserConnectionGateway.ensureConnectionReady = function ensureConnectionReady(res, connection) {
        if (!connection.ready) {
            (0, _http.respond500)(res, 'The connection is not ready yet.');
            return false;
        }

        return true;
    };

    // Route handlers


    BrowserConnectionGateway.onConnection = function onConnection(req, res, connection) {
        if (connection.ready) (0, _http.respond500)(res, 'The connection is already established.');else {
            var userAgent = req.headers['user-agent'];

            connection.establish(userAgent);
            (0, _http.redirect)(res, connection.idleUrl);
        }
    };

    BrowserConnectionGateway.onHeartbeat = function onHeartbeat(req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            var status = connection.heartbeat();

            (0, _http.respondWithJSON)(res, status);
        }
    };

    BrowserConnectionGateway.onIdle = function onIdle(req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) res.end(connection.renderIdlePage());
    };

    BrowserConnectionGateway.onIdleForced = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(req, res, connection) {
            var status;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
                                _context.next = 5;
                                break;
                            }

                            _context.next = 3;
                            return connection.getStatus(true);

                        case 3:
                            status = _context.sent;


                            (0, _http.redirect)(res, status.url);

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function onIdleForced(_x2, _x3, _x4) {
            return _ref.apply(this, arguments);
        }

        return onIdleForced;
    }();

    BrowserConnectionGateway.onStatusRequest = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(req, res, connection) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            return _context2.abrupt('return', BrowserConnectionGateway._onStatusRequestCore(req, res, connection, false));

                        case 1:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function onStatusRequest(_x5, _x6, _x7) {
            return _ref2.apply(this, arguments);
        }

        return onStatusRequest;
    }();

    BrowserConnectionGateway.onStatusRequestOnTestDone = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(req, res, connection) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            return _context3.abrupt('return', BrowserConnectionGateway._onStatusRequestCore(req, res, connection, true));

                        case 1:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function onStatusRequestOnTestDone(_x8, _x9, _x10) {
            return _ref3.apply(this, arguments);
        }

        return onStatusRequestOnTestDone;
    }();

    BrowserConnectionGateway._onStatusRequestCore = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(req, res, connection, isTestDone) {
            var status;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
                                _context4.next = 5;
                                break;
                            }

                            _context4.next = 3;
                            return connection.getStatus(isTestDone);

                        case 3:
                            status = _context4.sent;


                            (0, _http.respondWithJSON)(res, status);

                        case 5:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function _onStatusRequestCore(_x11, _x12, _x13, _x14) {
            return _ref4.apply(this, arguments);
        }

        return _onStatusRequestCore;
    }();

    BrowserConnectionGateway.onInitScriptRequest = function onInitScriptRequest(req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            var script = connection.getInitScript();

            (0, _http.respondWithJSON)(res, script);
        }
    };

    BrowserConnectionGateway.onInitScriptResponse = function onInitScriptResponse(req, res, connection) {
        if (BrowserConnectionGateway.ensureConnectionReady(res, connection)) {
            var data = '';

            req.on('data', function (chunk) {
                data += chunk;
            });

            req.on('end', function () {
                connection.handleInitScriptResult(data);

                res.end();
            });
        }
    };

    BrowserConnectionGateway.prototype._connectNextRemoteBrowser = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(req, res) {
            var remoteConnection;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            (0, _http.preventCaching)(res);

                            _context5.next = 3;
                            return this.remotesQueue.shift();

                        case 3:
                            remoteConnection = _context5.sent;


                            if (remoteConnection) (0, _http.redirect)(res, remoteConnection.url);else (0, _http.respond500)(res, 'There are no available connections to establish.');

                        case 5:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function _connectNextRemoteBrowser(_x15, _x16) {
            return _ref5.apply(this, arguments);
        }

        return _connectNextRemoteBrowser;
    }();

    // API


    BrowserConnectionGateway.prototype.startServingConnection = function startServingConnection(connection) {
        this.connections[connection.id] = connection;

        if (connection.browserInfo.providerName === 'remote') this.remotesQueue.add(connection);
    };

    BrowserConnectionGateway.prototype.stopServingConnection = function stopServingConnection(connection) {
        delete this.connections[connection.id];

        if (connection.browserInfo.providerName === 'remote') this.remotesQueue.remove(connection);
    };

    BrowserConnectionGateway.prototype.close = function close() {
        var _this3 = this;

        (0, _keys2.default)(this.connections).forEach(function (id) {
            return _this3.connections[id].close();
        });
    };

    return BrowserConnectionGateway;
}();

exports.default = BrowserConnectionGateway;
module.exports = exports['default'];