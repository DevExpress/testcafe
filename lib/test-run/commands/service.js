'use strict';

exports.__esModule = true;
exports.BackupStoragesCommand = exports.TestDoneCommand = exports.SetBreakpointCommand = exports.HideAssertionRetriesStatusCommand = exports.ShowAssertionRetriesStatusCommand = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Commands
var ShowAssertionRetriesStatusCommand = exports.ShowAssertionRetriesStatusCommand = function ShowAssertionRetriesStatusCommand(timeout) {
    (0, _classCallCheck3.default)(this, ShowAssertionRetriesStatusCommand);

    this.type = _type2.default.showAssertionRetriesStatus;
    this.timeout = timeout;
};

var HideAssertionRetriesStatusCommand = exports.HideAssertionRetriesStatusCommand = function HideAssertionRetriesStatusCommand(success) {
    (0, _classCallCheck3.default)(this, HideAssertionRetriesStatusCommand);

    this.type = _type2.default.hideAssertionRetriesStatus;
    this.success = success;
};

var SetBreakpointCommand = exports.SetBreakpointCommand = function SetBreakpointCommand(isTestError) {
    (0, _classCallCheck3.default)(this, SetBreakpointCommand);

    this.type = _type2.default.setBreakpoint;
    this.isTestError = isTestError;
};

var TestDoneCommand = exports.TestDoneCommand = function TestDoneCommand() {
    (0, _classCallCheck3.default)(this, TestDoneCommand);

    this.type = _type2.default.testDone;
};

var BackupStoragesCommand = exports.BackupStoragesCommand = function BackupStoragesCommand() {
    (0, _classCallCheck3.default)(this, BackupStoragesCommand);

    this.type = _type2.default.backupStorages;
};