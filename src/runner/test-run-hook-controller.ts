import processTestFnError from '../errors/process-test-fn-error';
import Test from '../api/structure/test';
import TEST_RUN_PHASE from '../test-run/phase';
import TestRun from '../test-run';

export default class TestRunHookController {
    public beforeFn?: Function;
    public afterFn?: Function;
    public started: boolean;
    public runningBeforeHook: boolean;
    public beforeHookErr: null | Error;
    public pendingTestRunCount: number;
    public testRunCtx: object;

    public constructor (tests: Test[], hook?: Hook) {
        this.beforeFn            = hook?.before;
        this.afterFn             = hook?.after;
        this.started             = false;
        this.runningBeforeHook   = false;
        this.beforeHookErr       = null;
        this.pendingTestRunCount = tests.length;
        this.testRunCtx          = Object.create(null);
    }

    public isTestBlocked (): boolean {
        return this.runningBeforeHook;
    }

    public async runTestRunBeforeHookIfNecessary (testRun: TestRun): Promise<boolean> {
        const shouldRunBeforeHook = !this.started && this.beforeFn;

        this.started = true;

        if (shouldRunBeforeHook) {
            this.runningBeforeHook = true;

            try {
                await (this.beforeFn as Function)(this.testRunCtx);
            }
            catch (err) {
                this.beforeHookErr = processTestFnError(err);
            }

            this.runningBeforeHook = false;
        }

        // NOTE: fail all tests if testRun.before hook has error
        if (this.beforeHookErr) {
            testRun.phase = TEST_RUN_PHASE.inTestRunBeforeHook;

            testRun.addError(this.beforeHookErr);

            return false;
        }

        testRun.testRunCtx = this.testRunCtx;

        return true;
    }

    public async runTestRunAfterHookIfNecessary (testRun: TestRun): Promise<void> {
        this.pendingTestRunCount--;

        if (this.pendingTestRunCount === 0 && this.afterFn) {
            testRun.phase = TEST_RUN_PHASE.inTestRunAfterHook;

            try {
                await this.afterFn(this.testRunCtx);
            }
            catch (err) {
                testRun.addError(processTestFnError(err));
            }
        }
    }
}
