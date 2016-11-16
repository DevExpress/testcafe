import Promise from 'pinkie';
import { noop } from 'lodash';
import testRunTracker from '../test-run-tracker';

// NOTE: Result promise can be decorated with additional properties,
// so we use symbols for internals to avoid interference.

/*global Symbol*/
var fn          = Symbol();
var taskPromise = Symbol();

export default class SelectorResultPromise extends Promise {
    constructor (executorFn) {
        super(noop);

        this[fn]          = executorFn;
        this[taskPromise] = null;
    }

    then (onFulfilled, onRejected) {
        if (!this[taskPromise])
            this[taskPromise] = new Promise(this[fn]);

        return this[taskPromise].then(onFulfilled, onRejected);
    }

    catch (onRejected) {
        if (!this[taskPromise])
            this[taskPromise] = new Promise(this[fn]);

        return this[taskPromise].catch(onRejected);
    }

    static fromFn (asyncExecutorFn) {
        var testRunId = testRunTracker.getContextTestRunId();

        if (testRunId)
            asyncExecutorFn = testRunTracker.addTrackingMarkerToFunction(testRunId, asyncExecutorFn);

        return new SelectorResultPromise(resolve => resolve(asyncExecutorFn()));
    }
}

