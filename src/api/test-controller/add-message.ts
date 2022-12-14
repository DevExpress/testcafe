import addRenderedWarning from '../../notifications/add-rendered-warning';
import TestRun from '../../test-run';
import TestCafeErrorList from '../../errors/error-list';

export function addWarnings (callsiteSet: Set<Record<string, any>>, message: string, testRun: TestRun): void {
    callsiteSet.forEach(callsite => {
        addRenderedWarning(testRun.warningLog, message, callsite);
        callsiteSet.delete(callsite);
    });
}

export function addErrors (callsiteSet: Set<Record<string, any>>, ErrorClass: any, errList: TestCafeErrorList): void {
    callsiteSet.forEach(callsite => {
        errList.addError(new ErrorClass(callsite));
        callsiteSet.delete(callsite);
    });
}
