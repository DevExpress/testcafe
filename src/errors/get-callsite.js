import createCallsiteRecord from 'callsite-record';
import stackCleaningHook from './stack-cleaning-hook';
import { wrapCallSite } from 'source-map-support';

const STACK_TRACE_LIMIT = 2000;

function getCallsite (options) {
    var originalStackCleaningEnabled = stackCleaningHook.enabled;
    var originalStackTraceLimit      = Error.stackTraceLimit;

    stackCleaningHook.enabled = false;
    Error.stackTraceLimit     = STACK_TRACE_LIMIT;

    var callsiteRecord = createCallsiteRecord(options);

    Error.stackTraceLimit     = originalStackTraceLimit;
    stackCleaningHook.enabled = originalStackCleaningEnabled;

    return callsiteRecord;
}

export function getCallsiteForMethod (methodName, typeName) {
    return getCallsite({ byFunctionName: methodName, typeName, processFrameFn: wrapCallSite });
}

export function getCallsiteForError (error, isCallsiteFrame) {
    return getCallsite({ forError: error, isCallsiteFrame });
}
