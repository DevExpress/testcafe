import createCallsiteRecord from 'callsite-record';
import stackCleaningHook from './stack-cleaning-hook';

const STACK_TRACE_LIMIT = 2000;

export default function getCallsite (methodName, typeName) {
    var originalStackCleaningEnabled = stackCleaningHook.enabled;
    var originalStackTraceLimit      = Error.stackTraceLimit;

    stackCleaningHook.enabled = false;
    Error.stackTraceLimit     = STACK_TRACE_LIMIT;

    var callsiteRecord = createCallsiteRecord(methodName, typeName);

    Error.stackTraceLimit     = originalStackTraceLimit;
    stackCleaningHook.enabled = originalStackCleaningEnabled;

    return callsiteRecord;
}
