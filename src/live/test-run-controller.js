import EventEmitter from 'events';
import Promise from 'pinkie';
import noop from 'lodash';
import { TestRunCtorFactory } from './test-run';
import TEST_RUN_STATE from './test-run-state';

class LiveModeTestRunController extends EventEmitter {
    constructor () {
        super();

        this.testWrappers      = [];
        this.expectedTestCount = 0;
        this._testRunCtor      = null;

        this.testRuns                = {};
        this.allTestsCompletePromise = Promise.resolve();
        this.completeAllRunningTests = noop;

        this.on('all-tests-complete', () => this.completeAllRunningTests());
    }

    get TestRunCtor () {
        if (!this._testRunCtor) {
            this._testRunCtor = TestRunCtorFactory({
                created:     testRun => this._onTestRunCreated(testRun),
                done:        (testRun, forced) => this._onTestRunDone(testRun, forced),
                readyToNext: testRun => this._onTestRunReadyToNext(testRun)
            });
        }

        return this._testRunCtor;
    }

    setExpectedTestCount (testCount) {
        this.expectedTestCount = testCount;
    }

    _getTestRuns () {
        return [].concat(...Object.values(this.testRuns));
    }

    run () {
        const readyToNextPromises = [];

        const testRuns = [].concat(...Object.values(this.testRuns));

        testRuns.forEach(testRun => {
            if (testRun.finish) {
                readyToNextPromises.push(testRun.readyToNextPromise);
                testRun.finish();
            }
        });

        this.testRuns = {};

        return Promise.all(readyToNextPromises);
    }

    stop () {
        this._getTestRuns().forEach(testRun => {
            testRun.stop();
        });
    }

    _getTestWrapper (test) {
        return this.testWrappers.find(w => w.test === test);
    }

    _onTestRunCreated (testRun) {

        this.allTestsCompletePromise = new Promise(resolve => {
            this.completeAllRunningTests = resolve;
        });

        const connectionId = testRun.browserConnection.id;

        this.testRuns[connectionId] = this.testRuns[connectionId] || [];

        this.testRuns[connectionId].push(testRun);
    }

    _onTestRunDone (testRun) {
        testRun.state = TEST_RUN_STATE.done;

        const hasRunningTests = this._getTestRuns().some(t => t.state !== TEST_RUN_STATE.done);

        if (!hasRunningTests)
            this.emit('all-tests-complete');

        const browserTestRuns = this.testRuns[testRun.browserConnection.id];

        testRun.readyToNextPromise = new Promise(resolve => {
            testRun.setReadyToNext = resolve;
        });


        if (browserTestRuns.length < this.expectedTestCount || browserTestRuns.some(t => t.state !== TEST_RUN_STATE.done))
            return Promise.resolve();

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
