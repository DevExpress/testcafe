'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _events = require('events');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _timeLimitPromise = require('time-limit-promise');

var _timeLimitPromise2 = _interopRequireDefault(_timeLimitPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var REMOTE_REDIRECT_TIMEOUT = 10000;
var ADDING_CONNECTION_WAITING_TIMEOUT = 10000;

var RemotesQueue = function () {
    function RemotesQueue() {
        (0, _classCallCheck3.default)(this, RemotesQueue);

        this.events = new _events.EventEmitter();
        this.shiftingTimeout = _pinkie2.default.resolve();
        this.pendingConnections = {};
    }

    RemotesQueue.prototype.add = function add(remoteConnection) {
        var _this = this;

        var connectionReadyPromise = (0, _promisifyEvent2.default)(remoteConnection, 'ready').then(function () {
            return _this.remove(remoteConnection);
        });

        this.pendingConnections[remoteConnection.id] = {
            connection: remoteConnection,
            readyPromise: connectionReadyPromise
        };

        this.events.emit('connection-added', remoteConnection.id);
    };

    RemotesQueue.prototype.remove = function remove(remoteConnection) {
        delete this.pendingConnections[remoteConnection.id];
    };

    RemotesQueue.prototype.shift = function shift() {
        var _this2 = this;

        var shiftingPromise = this.shiftingTimeout.then((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var headId;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            headId = (0, _keys2.default)(_this2.pendingConnections)[0];

                            if (headId) {
                                _context.next = 5;
                                break;
                            }

                            _context.next = 4;
                            return (0, _timeLimitPromise2.default)((0, _promisifyEvent2.default)(_this2.events, 'connection-added'), ADDING_CONNECTION_WAITING_TIMEOUT);

                        case 4:
                            headId = _context.sent;

                        case 5:
                            return _context.abrupt('return', headId ? _this2.pendingConnections[headId].connection : null);

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this2);
        })));

        this.shiftingTimeout = shiftingPromise.then(function (connection) {
            if (!connection) return _pinkie2.default.resolve();

            return (0, _timeLimitPromise2.default)(_this2.pendingConnections[connection.id].readyPromise, REMOTE_REDIRECT_TIMEOUT);
        });

        return shiftingPromise;
    };

    return RemotesQueue;
}();

exports.default = RemotesQueue;
module.exports = exports['default'];