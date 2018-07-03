'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _timeLimitPromise = require('time-limit-promise');

var _timeLimitPromise2 = _interopRequireDefault(_timeLimitPromise);

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _lodash = require('lodash');

var _mapReverse = require('map-reverse');

var _mapReverse2 = _interopRequireDefault(_mapReverse);

var _runtime = require('../errors/runtime');

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LOCAL_BROWSERS_READY_TIMEOUT = 2 * 60 * 1000;
var REMOTE_BROWSERS_READY_TIMEOUT = 6 * 60 * 1000;

var BrowserSet = function (_EventEmitter) {
    (0, _inherits3.default)(BrowserSet, _EventEmitter);

    function BrowserSet(browserConnectionGroups) {
        (0, _classCallCheck3.default)(this, BrowserSet);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.RELEASE_TIMEOUT = 10000;

        _this.pendingReleases = [];

        _this.browserConnectionGroups = browserConnectionGroups;
        _this.browserConnections = (0, _lodash.flatten)(browserConnectionGroups);

        _this.connectionsReadyTimeout = null;

        _this.browserErrorHandler = function (error) {
            return _this.emit('error', error);
        };

        _this.browserConnections.forEach(function (bc) {
            return bc.on('error', _this.browserErrorHandler);
        });

        // NOTE: We're setting an empty error handler, because Node kills the process on an 'error' event
        // if there is no handler. See: https://nodejs.org/api/events.html#events_class_events_eventemitter
        _this.on('error', _lodash.noop);
        return _this;
    }

    BrowserSet._waitIdle = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(bc) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!(bc.idle || !bc.ready)) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return');

                        case 2:
                            _context.next = 4;
                            return (0, _promisifyEvent2.default)(bc, 'idle');

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _waitIdle(_x) {
            return _ref.apply(this, arguments);
        }

        return _waitIdle;
    }();

    BrowserSet._closeConnection = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(bc) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(bc.closed || !bc.ready)) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return');

                        case 2:

                            bc.close();

                            _context2.next = 5;
                            return (0, _promisifyEvent2.default)(bc, 'closed');

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _closeConnection(_x2) {
            return _ref2.apply(this, arguments);
        }

        return _closeConnection;
    }();

    BrowserSet.prototype._getReadyTimeout = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
            var isLocalBrowser, remoteBrowsersExist;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            isLocalBrowser = function isLocalBrowser(connection) {
                                return connection.provider.isLocalBrowser(connection.id, connection.browserInfo.browserName);
                            };

                            _context3.next = 3;
                            return _pinkie2.default.all(this.browserConnections.map(isLocalBrowser));

                        case 3:
                            _context3.t0 = _context3.sent.indexOf(false);
                            _context3.t1 = -1;
                            remoteBrowsersExist = _context3.t0 > _context3.t1;
                            return _context3.abrupt('return', remoteBrowsersExist ? REMOTE_BROWSERS_READY_TIMEOUT : LOCAL_BROWSERS_READY_TIMEOUT);

                        case 7:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function _getReadyTimeout() {
            return _ref3.apply(this, arguments);
        }

        return _getReadyTimeout;
    }();

    BrowserSet.prototype._createPendingConnectionPromise = function _createPendingConnectionPromise(readyPromise, timeout, timeoutError) {
        var _this2 = this;

        var timeoutPromise = new _pinkie2.default(function (_, reject) {
            _this2.connectionsReadyTimeout = setTimeout(function () {
                return reject(timeoutError);
            }, timeout);
        });

        return _pinkie2.default.race([readyPromise, timeoutPromise]).then(function (value) {
            _this2.connectionsReadyTimeout.unref();
            return value;
        }, function (error) {
            _this2.connectionsReadyTimeout.unref();
            throw error;
        });
    };

    BrowserSet.prototype._waitConnectionsOpened = function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var connectionsReadyPromise, timeoutError, readyTimeout;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            connectionsReadyPromise = _pinkie2.default.all(this.browserConnections.filter(function (bc) {
                                return !bc.opened;
                            }).map(function (bc) {
                                return (0, _promisifyEvent2.default)(bc, 'opened');
                            }));
                            timeoutError = new _runtime.GeneralError(_message2.default.cantEstablishBrowserConnection);
                            _context4.next = 4;
                            return this._getReadyTimeout();

                        case 4:
                            readyTimeout = _context4.sent;
                            _context4.next = 7;
                            return this._createPendingConnectionPromise(connectionsReadyPromise, readyTimeout, timeoutError);

                        case 7:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function _waitConnectionsOpened() {
            return _ref4.apply(this, arguments);
        }

        return _waitConnectionsOpened;
    }();

    BrowserSet.prototype._checkForDisconnections = function _checkForDisconnections() {
        var disconnectedUserAgents = this.browserConnections.filter(function (bc) {
            return bc.closed;
        }).map(function (bc) {
            return bc.userAgent;
        });

        if (disconnectedUserAgents.length) throw new _runtime.GeneralError(_message2.default.cantRunAgainstDisconnectedBrowsers, disconnectedUserAgents.join(', '));
    };

    //API


    BrowserSet.from = function from(browserConnections) {
        var _this3 = this;

        var browserSet = new BrowserSet(browserConnections);

        var prepareConnection = _pinkie2.default.resolve().then(function () {
            browserSet._checkForDisconnections();
            return browserSet._waitConnectionsOpened();
        }).then(function () {
            return browserSet;
        });

        return _pinkie2.default.race([prepareConnection, (0, _promisifyEvent2.default)(browserSet, 'error')]).catch(function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(error) {
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return browserSet.dispose();

                            case 2:
                                throw error;

                            case 3:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, _this3);
            }));

            return function (_x3) {
                return _ref5.apply(this, arguments);
            };
        }());
    };

    BrowserSet.prototype.releaseConnection = function releaseConnection(bc) {
        var _this4 = this;

        if (this.browserConnections.indexOf(bc) < 0) return _pinkie2.default.resolve();

        (0, _lodash.pull)(this.browserConnections, bc);

        bc.removeListener('error', this.browserErrorHandler);

        var appropriateStateSwitch = !bc.permanent ? BrowserSet._closeConnection(bc) : BrowserSet._waitIdle(bc);

        var release = (0, _timeLimitPromise2.default)(appropriateStateSwitch, this.RELEASE_TIMEOUT).then(function () {
            return (0, _lodash.pull)(_this4.pendingReleases, release);
        });

        this.pendingReleases.push(release);

        return release;
    };

    BrowserSet.prototype.dispose = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6() {
            var _this5 = this;

            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            // NOTE: When browserConnection is cancelled, it is removed from
                            // the this.connections array, which leads to shifting indexes
                            // towards the beginning. So, we must copy the array in order to iterate it,
                            // or we can perform iteration from the end to the beginning.
                            if (this.connectionsReadyTimeout) this.connectionsReadyTimeout.unref();

                            (0, _mapReverse2.default)(this.browserConnections, function (bc) {
                                return _this5.releaseConnection(bc);
                            });

                            _context6.next = 4;
                            return _pinkie2.default.all(this.pendingReleases);

                        case 4:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function dispose() {
            return _ref6.apply(this, arguments);
        }

        return dispose;
    }();

    return BrowserSet;
}(_events.EventEmitter);

exports.default = BrowserSet;
module.exports = exports['default'];