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

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

var _delay = require('../../../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var POST_OPERATION_DELAY = 500;

var OperationsQueue = function () {
    function OperationsQueue() {
        (0, _classCallCheck3.default)(this, OperationsQueue);

        this.chainPromise = _pinkie2.default.resolve();
    }

    OperationsQueue.prototype.executeOperation = function executeOperation(operation) {
        var operationPromise = this.chainPromise.then(operation);

        this.chainPromise = operationPromise.then(function () {
            return (0, _delay2.default)(POST_OPERATION_DELAY);
        });

        return operationPromise;
    };

    return OperationsQueue;
}();

var BrowserStarter = function () {
    function BrowserStarter() {
        (0, _classCallCheck3.default)(this, BrowserStarter);

        // NOTE: You can't start multiple instances of the same app at the same time on macOS.
        // That's why a queue of opening requests is needed.
        this.macOSBrowserOpeningQueue = new OperationsQueue();
    }

    BrowserStarter.prototype.startBrowser = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            for (var _len = arguments.length, openArgs = Array(_len), _key = 0; _key < _len; _key++) {
                openArgs[_key] = arguments[_key];
            }

            var openBrowserOperation;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            openBrowserOperation = function openBrowserOperation() {
                                return _testcafeBrowserTools2.default.open.apply(_testcafeBrowserTools2.default, openArgs);
                            };

                            if (!_osFamily2.default.mac) {
                                _context.next = 6;
                                break;
                            }

                            _context.next = 4;
                            return this.macOSBrowserOpeningQueue.executeOperation(openBrowserOperation);

                        case 4:
                            _context.next = 8;
                            break;

                        case 6:
                            _context.next = 8;
                            return openBrowserOperation();

                        case 8:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function startBrowser() {
            return _ref.apply(this, arguments);
        }

        return startBrowser;
    }();

    return BrowserStarter;
}();

exports.default = BrowserStarter;
module.exports = exports['default'];