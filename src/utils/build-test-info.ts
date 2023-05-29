import TestRun from "../test-run";

export function buildTestInfo(testRun: TestRun) {
    return {
        name: testRun.test.name,
        meta: testRun.test.meta,
    }
}

export function buildFixtureInfo(testRun: TestRun) {
    return {
        name: testRun.test.fixture?.name,
        meta: testRun.test.fixture?.meta,
        path: testRun.test.fixture?.path,
    };
}
