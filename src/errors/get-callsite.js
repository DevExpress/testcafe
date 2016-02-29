import createCallsiteRecord from 'callsite-record';
import stackCleaningHook from './stack-cleaning-hook';

export default function getCallsite (methodName, typeName) {
    var stackCleaningEnabled = stackCleaningHook.enabled;

    stackCleaningHook.enabled = false;

    var callsiteRecord = createCallsiteRecord(methodName, typeName);

    stackCleaningHook.enabled = stackCleaningEnabled;

    return callsiteRecord;
}
