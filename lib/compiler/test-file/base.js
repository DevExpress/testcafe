'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TestFileCompilerBase = function () {
    function TestFileCompilerBase() {
        (0, _classCallCheck3.default)(this, TestFileCompilerBase);

        var escapedExt = (0, _lodash.escapeRegExp)(this.getSupportedExtension());

        this.supportedExtensionRe = new RegExp(escapedExt + '$');
    }

    TestFileCompilerBase.prototype._hasTests = function _hasTests() /* code */{
        throw new Error('Not implemented');
    };

    TestFileCompilerBase.prototype.getSupportedExtension = function getSupportedExtension() {
        throw new Error('Not implemented');
    };

    TestFileCompilerBase.prototype.compile = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            throw new Error('Not implemented');

                        case 1:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function compile() {
            return _ref.apply(this, arguments);
        }

        return compile;
    }();

    TestFileCompilerBase.prototype.canCompile = function canCompile(code, filename) {
        return this.supportedExtensionRe.test(filename) && this._hasTests(code);
    };

    TestFileCompilerBase.prototype.cleanUp = function cleanUp() {
        // NOTE: Optional. Do nothing by default.
    };

    return TestFileCompilerBase;
}();

exports.default = TestFileCompilerBase;
module.exports = exports['default'];