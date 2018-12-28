import EventEmitter from 'events';
import Promise from 'pinkie';
import { TestRunCtorFactory } from './test-run';
import { TEST_STATE, TEST_RUN_STATE } from './test-run-state';

class LiveModeTestRunController extends EventEmitter {
    constructor () {
        super();

        this.RUN_FINISHED_EVENT = 'run-finished-event';
        this.RUN_STOPPED_EVENT  = 'run-stopped-event';
        this.RUN_STARTED_EVENT  = 'run-started-event';

        this.testWrappers      = [];
        this.expectedTestCount = 0;
        this._testRunCtor      = null;
    }

    get TestRunCtor () {
        if (!this._testRunCtor) {
            this._testRunCtor = TestRunCtorFactory({
                created:     testRun => this._onTestRunCreated(testRun),
                started:     testRun => this._onTestRunStarted(testRun),
                done:        (testRun, forced) => this._onTestRunDone(testRun, forced),
                readyToNext: testRun => this._onTestRunReadyToNext(testRun)
            });
        }

        return this._testRunCtor;
    }

    run (testCount) {
        const readyToNextPromises = [];

        this.expectedTestCount = testCount;

        this.testWrappers.forEach(testWrapper => {
            testWrapper.testRuns.forEach(testRun => {
                if (testRun.finish) {
                    readyToNextPromises.push(testRun.readyToNextPromise);
                    testRun.finish();
                }
            });
        });

        this.testWrappers = [];

        return Promise.all(readyToNextPromises);
    }

    stop () {
        const runningTestWrappers = this.testWrappers.filter(w => w.state === TEST_STATE.running);

        runningTestWrappers.forEach(testWrapper => {
            testWrapper.testRuns.forEach(testRun => testRun.stop());
        });
    }

    _onTestRunCreated (testRun) {
        const testWrapper = {
            state:    TEST_STATE.created,
            testRuns: [testRun]
        };

        testRun.testWrapper = testWrapper;

        this.testWrappers.push(testWrapper);
    }

    _onTestRunStarted (testRun) {
        if (!this.testWrappers.filter(w => w.state !== TEST_STATE.created).length)
            this.emit(this.RUN_STARTED_EVENT, {});

        testRun.state             = TEST_RUN_STATE.running;
        testRun.testWrapper.state = TEST_STATE.running;
    }

    _onTestRunDone (testRun, forced) {
        const testWrapper = testRun.testWrapper;

        testRun.state = TEST_RUN_STATE.waitingForDone;

        const waitingTestRunCount = testWrapper.testRuns.filter(w => w.state === TEST_RUN_STATE.created).length;
        const runningTestRunCount = testWrapper.testRuns.filter(w => w.state === TEST_RUN_STATE.running).length;

        const waitForOtherTestRuns = runningTestRunCount || waitingTestRunCount && !forced;

        if (!waitForOtherTestRuns) {
            testWrapper.state = TEST_STATE.done;

            //check other active tests
            setTimeout(() => {
                const hasTestsToRun = this.testWrappers.length < this.expectedTestCount ||
                                      this.testWrappers.some(w => w.state === TEST_STATE.created) ||
                                      testRun.quarantine && !testRun.quarantine.isThresholdReached();

                if (!forced && hasTestsToRun)
                    testWrapper.testRuns.forEach(w => w.finish());
                else
                    this.emit(forced ? this.RUN_STOPPED_EVENT : this.RUN_FINISHED_EVENT);
            }, 0);
        }

        testRun.readyToNextPromise = new Promise(resolve => {
            testRun.setReadyToNext = resolve;
        });

        return new Promise(resolve => {
            testRun.finish = () => {
                testRun.finish = null;
                testRun.state  = TEST_RUN_STATE.done;
                resolve();
            };
        });
    }

    _onTestRunReadyToNext (testRun) {
        testRun.setReadyToNext();
    }
}

export default LiveModeTestRunController;
