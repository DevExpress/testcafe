import processTestFnError from './process-test-fn-error';

export default class TestCafeErrorList {
    constructor () {
        this.items = [];
    }

    get hasErrors () {
        return !!this.items.length;
    }

    addError (err) {
        if (err instanceof TestCafeErrorList)
            this.items = this.items.concat(err.items);
        else
            this.items.push(processTestFnError(err));
    }
}
