import TestRun from '../test-run';
import { Dictionary } from '../configuration/interfaces';

export function buildTestInfo (testRun: TestRun): { meta: Dictionary<string>; name: string | null } {
    return {
        name: testRun.test.name,
        meta: { ...testRun.test.meta },
    };
}

export function buildFixtureInfo (testRun: TestRun): { path: string | undefined; meta: Dictionary<string> | undefined; name: string | null | undefined } {
    return {
        name: testRun.test.fixture?.name,
        meta: { ...testRun.test.fixture?.meta },
        path: testRun.test.fixture?.path,
    };
}
