import EventEmitter from 'events';
import Promise from 'pinkie';
import { TestRunCtorFactory } from './test-run';

/* eslint-disable no-undef */
const liveTestRunStorage = Symbol('live-test-run-storage');
/* eslint-enable no-undef */

const TEST_STATE = {
    created: 'created',
    running: 'running',
    done:    'done'
};

const TEST_RUN_STATE = {
    created:        'created',
    running:        'running',
    waitingForDone: 'waiting-for-done',
    done:           'done'
};

class LiveModeTestRunController extends EventEmitter {
    constructor () {
        super();

        this.RUN_FINISHED_EVENT = 'run-finished-event';
        this.RUN_STOPPED_EVENT  = 'run-stopped-event';
        this.RUN_STARTED_EVENT  = 'run-started-event';

        this.testWrappers      = [];
        this.testRunWrappers   = [];
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
            }, {
                registerStopHandler: (testRun, handler) => {
                    this._getWrappers(testRun).testRunWrapper.stop = () => handler();
                }
            }, liveTestRunStorage);
        }

        return this._testRunCtor;
    }

    run (testCount) {
        const readyToNextPromises = [];

        this.expectedTestCount = testCount;

        this.testWrappers.forEach(testWrapper => {
            testWrapper.testRunWrappers.forEach(testRunWrapper => {
                if (testRunWrapper.finish) {
                    readyToNextPromises.push(testRunWrapper.readyToNextPromise);
                    testRunWrapper.finish();
                }
            });
        });

        return Promise.all(readyToNextPromises);
    }

    stop () {
        const runningTestWrappers = this.testWrappers.filter(w => w.state === TEST_RUN_STATE.running);

        runningTestWrappers.forEach(testWrapper => {
            testWrapper.testRunWrappers.forEach(testRunWrapper => testRunWrapper.stop());
        });
    }

    _getTestWrapper (test) {
        return this.testWrappers.find(w => w.test === test);
    }

    _getWrappers (testRun) {
        const test            = testRun[liveTestRunStorage].test;
        const testWrapper     = this._getTestWrapper(test);
        const testRunWrappers = testWrapper.testRunWrappers;
        const testRunWrapper  = testRunWrappers.find(w => w.testRun === testRun);

        return { testRunWrapper, testWrapper };
    }

    _onTestRunCreated (testRun) {
        this.testWrappers = [];

        const test = testRun[liveTestRunStorage].test;

        let testWrapper = this._getTestWrapper(test);

        if (!testWrapper) {
            testWrapper = {
                test,
                state:           TEST_STATE.created,
                testRunWrappers: []
            };

            this.testWrappers.push(testWrapper);
        }

        testWrapper.testRunWrappers.push({ testRun, state: TEST_RUN_STATE.created, finish: null, stop: null });
    }

    _onTestRunStarted (testRun) {
        if (!this.testWrappers.filter(w => w.state !== TEST_RUN_STATE.created).length)
            this.emit(this.RUN_STARTED_EVENT, {});

        const { testRunWrapper, testWrapper } = this._getWrappers(testRun);

        testRunWrapper.state = TEST_RUN_STATE.running;
        testWrapper.state    = TEST_STATE.running;
    }

    _onTestRunDone (testRun, forced) {
        const { testRunWrapper, testWrapper } = this._getWrappers(testRun);

        testRunWrapper.state = TEST_RUN_STATE.waitingForDone;

        const waitingTestRunCount = testWrapper.testRunWrappers.filter(w => w.state === TEST_RUN_STATE.created).length;
        const runningTestRunCount = testWrapper.testRunWrappers.filter(w => w.state === TEST_RUN_STATE.running).length;

        const waitForOtherTestRuns = runningTestRunCount || waitingTestRunCount && !forced;

        if (!waitForOtherTestRuns) {
            testWrapper.state = TEST_STATE.done;

            //check other active tests
            setTimeout(() => {
                const hasTestsToRun = this.testWrappers.length < this.expectedTestCount ||
                                      !!this.testWrappers.filter(w => w.state === TEST_STATE.created).length ||
                                      testRun.quarantine && !testRun.quarantine.isThresholdReached();

                if (!forced && hasTestsToRun)
                    testWrapper.testRunWrappers.forEach(w => w.finish());
                else
                    this.emit(forced ? this.RUN_STOPPED_EVENT : this.RUN_FINISHED_EVENT);
            }, 0);
        }

        testRunWrapper.readyToNextPromise = new Promise(resolve => {
            testRunWrapper.setReadyToNext = resolve;
        });

        return new Promise(resolve => {
            testRunWrapper.finish = () => {
                testRunWrapper.finish = null;
                testRunWrapper.state  = TEST_RUN_STATE.done;
                resolve();
            };
        });
    }

    _onTestRunReadyToNext (testRun) {
        const { testRunWrapper } = this._getWrappers(testRun);

        testRunWrapper.setReadyToNext();
    }
}

export default LiveModeTestRunController;
