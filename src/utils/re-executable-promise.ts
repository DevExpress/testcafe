// TODO: Fix https://github.com/DevExpress/testcafe/issues/4139 to get rid of Pinkie
import Promise from 'pinkie';
import { noop } from 'lodash';
import testRunTracker from '../api/test-run-tracker';

type ExecutorFn = (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void;
type OnFulfilledFn = ((value: unknown) => unknown | PromiseLike<unknown>) | undefined | null;
type OnRejectedFn = ((reason?: unknown) => PromiseLike<never>) | null | undefined;

export default class ReExecutablePromise extends Promise<unknown> {
    private readonly _fn: ExecutorFn;
    private _taskPromise: Promise<unknown> | null;

    public constructor (executorFn: ExecutorFn) {
        super(noop);

        this._fn          = executorFn;
        this._taskPromise = null;
    }

    private _ensureExecuting (): void {
        if (!this._taskPromise)
            this._taskPromise = new Promise(this._fn);
    }

    public _reExecute (): ReExecutablePromise {
        this._taskPromise = null;

        return this;
    }

    public then (onFulfilled?: OnFulfilledFn, onRejected?: OnRejectedFn): any {
        this._ensureExecuting();

        return (this._taskPromise as Promise<unknown>).then(onFulfilled, onRejected);
    }

    public catch (onRejected?: OnRejectedFn): Promise<unknown> {
        this._ensureExecuting();

        return (this._taskPromise as Promise<unknown>).catch(onRejected);
    }

    public static fromFn (asyncExecutorFn: Function): ReExecutablePromise {
        const testRunId = testRunTracker.getContextTestRunId();

        if (testRunId)
            asyncExecutorFn = testRunTracker.addTrackingMarkerToFunction(testRunId, asyncExecutorFn);

        return new ReExecutablePromise((resolve: Function) => resolve(asyncExecutorFn()));
    }
}
