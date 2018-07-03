'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _child_process = require('child_process');

var _path = require('path');

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _treeKill = require('tree-kill');

var _treeKill2 = _interopRequireDefault(_treeKill);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _delay = require('../utils/delay');

var _delay2 = _interopRequireDefault(_delay);

var _runtime = require('../errors/runtime');

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MODULES_BIN_DIR = (0, _path.join)(process.cwd(), './node_modules/.bin');

var ENV_PATH_KEY = function () {
    if (_osFamily2.default.win) {
        var pathKey = 'Path';

        (0, _keys2.default)(process.env).forEach(function (key) {
            if (key.toLowerCase() === 'path') pathKey = key;
        });

        return pathKey;
    }

    return 'PATH';
}();

var TestedApp = function () {
    function TestedApp() {
        (0, _classCallCheck3.default)(this, TestedApp);

        this.process = null;
        this.errorPromise = null;
        this.killed = false;
    }

    TestedApp.prototype.start = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(command, initDelay) {
            var _this = this;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            this.errorPromise = new _pinkie2.default(function (resolve, reject) {
                                var env = (0, _assign2.default)({}, process.env);
                                var path = env[ENV_PATH_KEY] || '';
                                var pathParts = path.split(_path.delimiter);

                                pathParts.unshift(MODULES_BIN_DIR);

                                env[ENV_PATH_KEY] = pathParts.join(_path.delimiter);

                                _this.process = (0, _child_process.exec)(command, { env: env }, function (err) {
                                    if (!_this.killed && err) {
                                        var message = err.stack || String(err);

                                        reject(new _runtime.GeneralError(_message2.default.testedAppFailedWithError, message));
                                    }
                                });
                            });

                            _context.next = 3;
                            return _pinkie2.default.race([(0, _delay2.default)(initDelay), this.errorPromise]);

                        case 3:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function start(_x, _x2) {
            return _ref.apply(this, arguments);
        }

        return start;
    }();

    TestedApp.prototype.kill = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
            var _this2 = this;

            var killPromise;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            this.killed = true;

                            killPromise = new _pinkie2.default(function (resolve) {
                                return (0, _treeKill2.default)(_this2.process.pid, 'SIGTERM', resolve);
                            });
                            _context2.next = 4;
                            return killPromise;

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function kill() {
            return _ref2.apply(this, arguments);
        }

        return kill;
    }();

    return TestedApp;
}();

exports.default = TestedApp;
module.exports = exports['default'];