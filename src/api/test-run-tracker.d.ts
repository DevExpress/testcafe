import TestRun from '../test-run';
import TestRunProxy from '../services/compiler/test-run-proxy';

export interface TestRunTracker {
    activeTestRuns: { [id: string]: TestRun | TestRunProxy };
    addTrackingMarkerToFunction(testRunId: string, fn: Function): Function;
    ensureEnabled(): void;
    resolveContextTestRun(): TestRun;
}

declare const testRunTracker: TestRunTracker;

export default testRunTracker;

