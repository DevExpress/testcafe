import TEST_RUN_STATE from '../test-run/state';
import processTestFnError from '../errors/process-test-fn-error';

export default class FixtureHookController {
    constructor (tests, browserConnectionCount) {
        this.fixtureMap = FixtureHookController._createFixtureMap(tests, browserConnectionCount);
    }

    static _ensureFixtureMapItem (fixtureMap, fixture) {
        if (!fixtureMap.has(fixture)) {
            var item = {
                started:                  false,
                runningFixtureBeforeHook: false,
                fixtureBeforeHookErr:     null,
                pendingTestRunCount:      0,
                fixtureCtx:               Object.create(null)
            };

            fixtureMap.set(fixture, item);
        }
    }

    static _createFixtureMap (tests, browserConnectionCount) {
        return tests.reduce((fixtureMap, test) => {
            var fixture = test.fixture;

            if (!test.skip) {
                FixtureHookController._ensureFixtureMapItem(fixtureMap, fixture);

                var item = fixtureMap.get(fixture);

                item.pendingTestRunCount += browserConnectionCount;
            }

            return fixtureMap;
        }, new Map());
    }

    _getFixtureMapItem (testRun) {
        return testRun.test.skip ? null : this.fixtureMap.get(testRun.test.fixture);
    }

    isTestRunBlocked (testRun) {
        var item = this._getFixtureMapItem(testRun);

        return item && item.runningFixtureBeforeHook;
    }

    async runFixtureBeforeHookIfNecessary (testRun) {
        var fixture = testRun.test.fixture;
        var item    = this._getFixtureMapItem(testRun);

        if (item) {
            var shouldRunBeforeHook = !item.started && fixture.beforeFn;

            item.started = true;

            if (shouldRunBeforeHook) {
                item.runningFixtureBeforeHook = true;

                try {
                    await fixture.beforeFn(item.fixtureCtx);
                }
                catch (err) {
                    item.fixtureBeforeHookErr = processTestFnError(err);
                }

                item.runningFixtureBeforeHook = false;
            }

            // NOTE: fail all tests in fixture if fixture.before hook has error
            if (item.fixtureBeforeHookErr) {
                testRun.state = TEST_RUN_STATE.inFixtureBeforeHook;

                testRun.addError(item.fixtureBeforeHookErr);

                return false;
            }

            testRun.fixtureCtx = item.fixtureCtx;
        }

        return true;
    }

    async runFixtureAfterHookIfNecessary (testRun) {
        var fixture = testRun.test.fixture;
        var item    = this._getFixtureMapItem(testRun);

        if (item) {
            item.pendingTestRunCount--;

            if (item.pendingTestRunCount === 0 && fixture.afterFn) {
                testRun.state = TEST_RUN_STATE.inFixtureAfterHook;

                try {
                    await fixture.afterFn(item.fixtureCtx);
                }
                catch (err) {
                    testRun.addError(processTestFnError(err));
                }
            }
        }
    }
}
