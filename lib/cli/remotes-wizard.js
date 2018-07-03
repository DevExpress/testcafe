'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _qrcodeTerminal = require('qrcode-terminal');

var _qrcodeTerminal2 = _interopRequireDefault(_qrcodeTerminal);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(testCafe, remoteCount, showQRCode) {
        var connectionPromises, description, connectionUrl, i;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        connectionPromises = [];


                        if (remoteCount) {
                            _log2.default.hideSpinner();

                            description = (0, _dedent2.default)('\n            Connecting ' + remoteCount + ' remote browser(s)...\n            Navigate to the following URL from each remote browser.\n        ');


                            _log2.default.write(description);

                            if (showQRCode) _log2.default.write('You can either enter the URL or scan the QR-code.');

                            connectionUrl = testCafe.browserConnectionGateway.connectUrl;


                            _log2.default.write('Connect URL: ' + _chalk2.default.underline.blue(connectionUrl));

                            if (showQRCode) _qrcodeTerminal2.default.generate(connectionUrl);

                            for (i = 0; i < remoteCount; i++) {
                                connectionPromises.push(testCafe.createBrowserConnection().then(function (bc) {
                                    return (0, _promisifyEvent2.default)(bc, 'ready').then(function () {
                                        return bc;
                                    });
                                }).then(function (bc) {
                                    _log2.default.hideSpinner();
                                    _log2.default.write(_chalk2.default.green('CONNECTED') + ' ' + bc.userAgent);
                                    _log2.default.showSpinner();
                                    return bc;
                                }));
                            }

                            _log2.default.showSpinner();
                        }

                        _context.next = 4;
                        return _pinkie2.default.all(connectionPromises);

                    case 4:
                        return _context.abrupt('return', _context.sent);

                    case 5:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

module.exports = exports['default'];