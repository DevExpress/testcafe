import TestRun from '../test-run';

export function getTestRunTestInfo (testRun: TestRun): object {
    return {
        name: testRun.test.name,
        meta: { ...testRun.test.meta },
    };
}

export function getTestRunFixtureInfo (testRun: TestRun): object {
    return {
        name: testRun.test.fixture?.name,
        path: testRun.test.fixture?.path,
        meta: { ...testRun.test.fixture?.meta },
    };
}
