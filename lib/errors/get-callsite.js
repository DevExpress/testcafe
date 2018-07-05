'use strict';

exports.__esModule = true;
exports.getCallsiteForMethod = getCallsiteForMethod;
exports.getCallsiteForError = getCallsiteForError;

var _callsiteRecord = require('callsite-record');

var _callsiteRecord2 = _interopRequireDefault(_callsiteRecord);

var _stackCleaningHook = require('./stack-cleaning-hook');

var _stackCleaningHook2 = _interopRequireDefault(_stackCleaningHook);

var _sourceMapSupport = require('source-map-support');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var STACK_TRACE_LIMIT = 2000;

function getCallsite(options) {
    var originalStackCleaningEnabled = _stackCleaningHook2.default.enabled;
    var originalStackTraceLimit = Error.stackTraceLimit;

    _stackCleaningHook2.default.enabled = false;
    Error.stackTraceLimit = STACK_TRACE_LIMIT;

    var callsiteRecord = (0, _callsiteRecord2.default)(options);

    Error.stackTraceLimit = originalStackTraceLimit;
    _stackCleaningHook2.default.enabled = originalStackCleaningEnabled;

    return callsiteRecord;
}

function getCallsiteForMethod(methodName, typeName) {
    return getCallsite({ byFunctionName: methodName, typeName: typeName, processFrameFn: _sourceMapSupport.wrapCallSite });
}

function getCallsiteForError(error, isCallsiteFrame) {
    // NOTE: "source-map-support" process this kind of error automatically, cause
    // in this case there is an appeal to "err.stack" inside "callsite-record" which
    // provokes wrapping of frames, so there is no need to specify "processFrameFn".
    return getCallsite({ forError: error, isCallsiteFrame: isCallsiteFrame });
}