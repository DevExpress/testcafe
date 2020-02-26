import processTestFnError from './process-test-fn-error';
import { UncaughtErrorInTestCode } from './test-run';

export default class TestCafeErrorList {
    constructor () {
        this.items = [];
        this.name  = TestCafeErrorList.name;
    }

    get hasErrors () {
        return !!this.items.length;
    }

    get hasUncaughtErrorsInTestCode () {
        return this.items.some(item => item instanceof UncaughtErrorInTestCode);
    }

    addError (err) {
        if (err instanceof TestCafeErrorList)
            this.items = this.items.concat(err.items);
        else
            this.items.push(processTestFnError(err));
    }
}
