import Promise from 'pinkie';
import { noop } from 'lodash';
import testRunTracker from '../api/test-run-tracker';

export default class ReExecutablePromise extends Promise {
    constructor (executorFn) {
        super(noop);

        this._fn          = executorFn;
        this._taskPromise = null;
    }

    _ensureExecuting () {
        if (!this._taskPromise)
            this._taskPromise = new Promise(this._fn);
    }

    _reExecute () {
        this._taskPromise = null;

        return this;
    }

    then (onFulfilled, onRejected) {
        this._ensureExecuting();

        return this._taskPromise.then(onFulfilled, onRejected);
    }

    catch (onRejected) {
        this._ensureExecuting();

        return this._taskPromise.catch(onRejected);
    }

    static fromFn (asyncExecutorFn) {
        var testRunId = testRunTracker.getContextTestRunId();

        if (testRunId)
            asyncExecutorFn = testRunTracker.addTrackingMarkerToFunction(testRunId, asyncExecutorFn);

        return new ReExecutablePromise(resolve => resolve(asyncExecutorFn()));
    }
}
