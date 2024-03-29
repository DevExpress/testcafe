import createCallsiteRecord from '@devexpress/callsite-record';
import stackCleaningHook from './stack-cleaning-hook';
import { wrapCallSite } from 'source-map-support';

const STACK_TRACE_LIMIT = 2000;

function getCallsite (options) {
    const originalStackCleaningEnabled = stackCleaningHook.enabled;
    const originalStackTraceLimit      = Error.stackTraceLimit;

    stackCleaningHook.enabled = false;
    Error.stackTraceLimit     = STACK_TRACE_LIMIT;

    const callsiteRecord = createCallsiteRecord(options);

    Error.stackTraceLimit     = originalStackTraceLimit;
    stackCleaningHook.enabled = originalStackCleaningEnabled;

    return callsiteRecord;
}

export function getCallsiteForMethod (methodName, typeName) {
    return getCallsite({ byFunctionName: methodName, typeName, processFrameFn: wrapCallSite });
}

export function getCallsiteForError (error, isCallsiteFrame) {
    // NOTE: "source-map-support" process this kind of error automatically, cause
    // in this case there is an appeal to "err.stack" inside "@devexpress/callsite-record" which
    // provokes wrapping of frames, so there is no need to specify "processFrameFn".
    return getCallsite({ forError: error, isCallsiteFrame });
}
