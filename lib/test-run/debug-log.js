'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _indentString = require('indent-string');

var _indentString2 = _interopRequireDefault(_indentString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TestRunDebugLog = function () {
    function TestRunDebugLog(userAgent) {
        (0, _classCallCheck3.default)(this, TestRunDebugLog);

        this.driverMessageLogger = (0, _debug2.default)('testcafe:test-run:' + userAgent + ':driver-message');
        this.commandLogger = (0, _debug2.default)('testcafe:test-run:' + userAgent + ':command');
    }

    TestRunDebugLog._addEntry = function _addEntry(logger, data) {
        var entry = data ? (0, _indentString2.default)('\n' + (0, _stringify2.default)(data, null, 2) + '\n', ' ', 4) : '';

        logger(entry);
    };

    TestRunDebugLog.prototype.driverMessage = function driverMessage(msg) {
        TestRunDebugLog._addEntry(this.driverMessageLogger, msg);
    };

    TestRunDebugLog.prototype.command = function command(cmd) {
        TestRunDebugLog._addEntry(this.commandLogger, cmd);
    };

    return TestRunDebugLog;
}();

exports.default = TestRunDebugLog;
module.exports = exports['default'];