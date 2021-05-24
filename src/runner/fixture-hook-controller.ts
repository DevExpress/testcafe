import TEST_RUN_PHASE from '../test-run/phase';
import processTestFnError from '../errors/process-test-fn-error';
import Test from '../api/structure/test';
import Fixture from '../api/structure/fixture';
import TestRun from '../test-run';

interface FixtureState {
    started: boolean;
    runningFixtureBeforeHook: boolean;
    fixtureBeforeHookErr: null | Error;
    pendingTestRunCount: number;
    fixtureCtx: object;
}

export default class FixtureHookController {
    private readonly _fixtureMap: Map<Fixture, FixtureState>;

    public constructor (tests: Test[], browserConnectionCount: number) {
        this._fixtureMap = FixtureHookController._createFixtureMap(tests, browserConnectionCount);
    }

    private static _ensureFixtureMapItem (fixtureMap: Map<Fixture, FixtureState>, fixture: Fixture): void {
        if (!fixtureMap.has(fixture)) {
            const item = {
                started:                  false,
                runningFixtureBeforeHook: false,
                fixtureBeforeHookErr:     null,
                pendingTestRunCount:      0,
                fixtureCtx:               Object.create(null)
            };

            fixtureMap.set(fixture, item);
        }
    }

    private static _createFixtureMap (tests: Test[], browserConnectionCount: number): Map<Fixture, FixtureState> {
        return tests.reduce((fixtureMap, test) => {
            const fixture = test.fixture;

            if (!test.skip) {
                FixtureHookController._ensureFixtureMapItem(fixtureMap, fixture);

                const item = fixtureMap.get(fixture);

                item.pendingTestRunCount += browserConnectionCount;
            }

            return fixtureMap;
        }, new Map());
    }

    private _getFixtureMapItem (test: Test): null | FixtureState | undefined {
        return test.skip ? null : this._fixtureMap.get(test.fixture);
    }

    public isTestBlocked (test: Test): boolean {
        const item = this._getFixtureMapItem(test);

        return !!item && item.runningFixtureBeforeHook;
    }

    public async runFixtureBeforeHookIfNecessary (testRun: TestRun): Promise<boolean> {
        const fixture = testRun.test.fixture;
        const item    = this._getFixtureMapItem(testRun.test);

        if (item) {
            const shouldRunBeforeHook = !item.started && fixture.beforeFn;

            item.started = true;

            if (shouldRunBeforeHook) {
                item.runningFixtureBeforeHook = true;

                try {
                    await (fixture.beforeFn as Function)(item.fixtureCtx);
                }
                catch (err) {
                    item.fixtureBeforeHookErr = processTestFnError(err);
                }

                item.runningFixtureBeforeHook = false;
            }

            // NOTE: fail all tests in fixture if fixture.before hook has error
            if (item.fixtureBeforeHookErr) {
                testRun.phase = TEST_RUN_PHASE.inFixtureBeforeHook;

                testRun.addError(item.fixtureBeforeHookErr);

                return false;
            }

            testRun.fixtureCtx = item.fixtureCtx;
        }

        return true;
    }

    public async runFixtureAfterHookIfNecessary (testRun: TestRun): Promise<void> {
        const fixture = testRun.test.fixture;
        const item    = this._getFixtureMapItem(testRun.test);

        if (item) {
            item.pendingTestRunCount--;

            if (item.pendingTestRunCount === 0 && fixture.afterFn) {
                testRun.phase = TEST_RUN_PHASE.inFixtureAfterHook;

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
