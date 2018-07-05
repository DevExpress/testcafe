'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _net = require('net');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _promisifiedFunctions = require('../../../../utils/promisified-functions');

var _delay = require('../../../../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _clientFunctions = require('../../utils/client-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CONNECTION_READY_TIMEOUT = 300;
var MAX_CONNECTION_RETRY_COUNT = 100;
var MAX_RESIZE_RETRY_COUNT = 2;
var HEADER_SEPARATOR = ':';

module.exports = function () {
    function MarionetteClient() {
        var port = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2828;
        var host = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '127.0.0.1';
        (0, _classCallCheck3.default)(this, MarionetteClient);

        this.currentPacketNumber = 1;
        this.events = new _events2.default();
        this.port = port;
        this.host = host;
        this.socket = new _net.Socket();
        this.buffer = Buffer.alloc(0);
        this.getPacketPromise = _pinkie2.default.resolve();
        this.sendPacketPromise = _pinkie2.default.resolve();

        this.protocolInfo = {
            applicationType: '',
            marionetteProtocol: ''
        };

        this.sessionInfo = null;
    }

    MarionetteClient.prototype._attemptToConnect = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(port, host) {
            var _this = this;

            var connectionPromise;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            this.socket.connect(port, host);

                            connectionPromise = _pinkie2.default.race([(0, _promisifyEvent2.default)(this.socket, 'connect'), (0, _promisifyEvent2.default)(this.socket, 'error')]);
                            _context.next = 4;
                            return connectionPromise.then(function () {
                                return true;
                            }).catch(function () {
                                _this.socket.removeAllListeners('connect');
                                return (0, _delay2.default)(CONNECTION_READY_TIMEOUT);
                            });

                        case 4:
                            return _context.abrupt('return', _context.sent);

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _attemptToConnect(_x3, _x4) {
            return _ref.apply(this, arguments);
        }

        return _attemptToConnect;
    }();

    MarionetteClient.prototype._connectSocket = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(port, host) {
            var _this2 = this;

            var connected, i;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return this._attemptToConnect(port, host);

                        case 2:
                            connected = _context2.sent;
                            i = 0;

                        case 4:
                            if (!(!connected && i < MAX_CONNECTION_RETRY_COUNT)) {
                                _context2.next = 11;
                                break;
                            }

                            _context2.next = 7;
                            return this._attemptToConnect(port, host);

                        case 7:
                            connected = _context2.sent;

                        case 8:
                            i++;
                            _context2.next = 4;
                            break;

                        case 11:
                            if (connected) {
                                _context2.next = 13;
                                break;
                            }

                            throw new Error('Unable to connect');

                        case 13:

                            this.socket.on('data', function (data) {
                                return _this2._handleNewData(data);
                            });

                        case 14:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function _connectSocket(_x5, _x6) {
            return _ref2.apply(this, arguments);
        }

        return _connectSocket;
    }();

    MarionetteClient.prototype._writeSocket = function () {
        var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(message) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (this.socket.write(message)) {
                                _context3.next = 3;
                                break;
                            }

                            _context3.next = 3;
                            return (0, _promisifyEvent2.default)(this.socket, 'drain');

                        case 3:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function _writeSocket(_x7) {
            return _ref3.apply(this, arguments);
        }

        return _writeSocket;
    }();

    MarionetteClient.prototype._handleNewData = function _handleNewData(data) {
        if (!data) return;

        this.buffer = Buffer.concat([this.buffer, data]);

        this.events.emit('new-data');
    };

    MarionetteClient.prototype._getPacket = function _getPacket() {
        var _this3 = this;

        this.getPacketPromise = this.getPacketPromise.then((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
            var headerEndIndex, packet, bodyStartIndex, bodyEndIndex;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            headerEndIndex = _this3.buffer.indexOf(HEADER_SEPARATOR);

                        case 1:
                            if (!(headerEndIndex < 0)) {
                                _context4.next = 7;
                                break;
                            }

                            _context4.next = 4;
                            return (0, _promisifyEvent2.default)(_this3.events, 'new-data');

                        case 4:

                            headerEndIndex = _this3.buffer.indexOf(HEADER_SEPARATOR);
                            _context4.next = 1;
                            break;

                        case 7:
                            packet = {
                                length: NaN,
                                body: null
                            };


                            packet.length = parseInt(_this3.buffer.toString('utf8', 0, headerEndIndex), 10) || 0;

                            bodyStartIndex = headerEndIndex + HEADER_SEPARATOR.length;
                            bodyEndIndex = bodyStartIndex + packet.length;

                            if (!packet.length) {
                                _context4.next = 18;
                                break;
                            }

                        case 12:
                            if (!(_this3.buffer.length < bodyEndIndex)) {
                                _context4.next = 17;
                                break;
                            }

                            _context4.next = 15;
                            return (0, _promisifyEvent2.default)(_this3.events, 'new-data');

                        case 15:
                            _context4.next = 12;
                            break;

                        case 17:

                            packet.body = JSON.parse(_this3.buffer.toString('utf8', bodyStartIndex, bodyEndIndex));

                        case 18:

                            _this3.buffer = _this3.buffer.slice(bodyEndIndex);

                            return _context4.abrupt('return', packet);

                        case 20:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this3);
        })));

        return this.getPacketPromise;
    };

    MarionetteClient.prototype._sendPacket = function _sendPacket(payload) {
        var _this4 = this;

        this.sendPacketPromise = this.sendPacketPromise.then((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
            var body, serialized, message;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            body = [0, _this4.currentPacketNumber++, payload.command, payload.parameters];
                            serialized = (0, _stringify2.default)(body);
                            message = Buffer.byteLength(serialized, 'utf8') + HEADER_SEPARATOR + serialized;


                            _this4._writeSocket(message);

                        case 4:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, _this4);
        })));

        return this.sendPacketPromise;
    };

    MarionetteClient.prototype._throwMarionetteError = function _throwMarionetteError(error) {
        throw new Error('' + error.error + (error.message ? ': ' + error.message : ''));
    };

    MarionetteClient.prototype._getResponse = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(packet) {
            var packetNumber, responsePacket;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            packetNumber = this.currentPacketNumber;
                            _context6.next = 3;
                            return this._sendPacket(packet);

                        case 3:
                            _context6.next = 5;
                            return this._getPacket();

                        case 5:
                            responsePacket = _context6.sent;

                        case 6:
                            if (!(!responsePacket.body || responsePacket.body[1] !== packetNumber)) {
                                _context6.next = 12;
                                break;
                            }

                            _context6.next = 9;
                            return this._getPacket();

                        case 9:
                            responsePacket = _context6.sent;
                            _context6.next = 6;
                            break;

                        case 12:

                            if (responsePacket.body[2]) this._throwMarionetteError(responsePacket.body[2]);

                            return _context6.abrupt('return', responsePacket.body[3]);

                        case 14:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function _getResponse(_x8) {
            return _ref6.apply(this, arguments);
        }

        return _getResponse;
    }();

    MarionetteClient.prototype.connect = function () {
        var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7() {
            var infoPacket;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.next = 2;
                            return this._connectSocket(this.port, this.host);

                        case 2:
                            _context7.next = 4;
                            return this._getPacket();

                        case 4:
                            infoPacket = _context7.sent;


                            this.protocolInfo = {
                                applicationType: infoPacket.body.applicationType,
                                marionetteProtocol: infoPacket.body.marionetteProtocol
                            };

                            _context7.next = 8;
                            return this._getResponse({ command: 'newSession' });

                        case 8:
                            this.sessionInfo = _context7.sent;

                        case 9:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function connect() {
            return _ref7.apply(this, arguments);
        }

        return connect;
    }();

    MarionetteClient.prototype.dispose = function dispose() {
        this.socket.end();
        this.buffer = null;
    };

    MarionetteClient.prototype.executeScript = function () {
        var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(code) {
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.next = 2;
                            return this._getResponse({ command: 'executeScript', parameters: { script: 'return (' + code + ')()' } });

                        case 2:
                            return _context8.abrupt('return', _context8.sent);

                        case 3:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function executeScript(_x9) {
            return _ref8.apply(this, arguments);
        }

        return executeScript;
    }();

    MarionetteClient.prototype.takeScreenshot = function () {
        var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(path) {
            var screenshot;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.next = 2;
                            return this._getResponse({ command: 'takeScreenshot' });

                        case 2:
                            screenshot = _context9.sent;
                            _context9.next = 5;
                            return (0, _promisifiedFunctions.writeFile)(path, screenshot.value, { encoding: 'base64' });

                        case 5:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function takeScreenshot(_x10) {
            return _ref9.apply(this, arguments);
        }

        return takeScreenshot;
    }();

    MarionetteClient.prototype.setWindowSize = function () {
        var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(width, height) {
            var _ref11, pageRect, attemptCounter, currentRect, _ref12;

            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            _context10.next = 2;
                            return this.executeScript(_clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

                        case 2:
                            _ref11 = _context10.sent;
                            pageRect = _ref11.value;
                            attemptCounter = 0;

                        case 5:
                            if (!(attemptCounter++ < MAX_RESIZE_RETRY_COUNT && (pageRect.width !== width || pageRect.height !== height))) {
                                _context10.next = 17;
                                break;
                            }

                            _context10.next = 8;
                            return this._getResponse({ command: 'getWindowRect' });

                        case 8:
                            currentRect = _context10.sent;
                            _context10.next = 11;
                            return this._getResponse({
                                command: 'setWindowRect',

                                parameters: {
                                    x: currentRect.x,
                                    y: currentRect.y,
                                    width: width + (currentRect.width - pageRect.width),
                                    height: height + (currentRect.height - pageRect.height)
                                }
                            });

                        case 11:
                            _context10.next = 13;
                            return this.executeScript(_clientFunctions.GET_WINDOW_DIMENSIONS_INFO_SCRIPT);

                        case 13:
                            _ref12 = _context10.sent;
                            pageRect = _ref12.value;
                            _context10.next = 5;
                            break;

                        case 17:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function setWindowSize(_x11, _x12) {
            return _ref10.apply(this, arguments);
        }

        return setWindowSize;
    }();

    MarionetteClient.prototype.quit = function () {
        var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11() {
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            _context11.next = 2;
                            return this._getResponse({ command: 'quit' });

                        case 2:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function quit() {
            return _ref13.apply(this, arguments);
        }

        return quit;
    }();

    return MarionetteClient;
}();