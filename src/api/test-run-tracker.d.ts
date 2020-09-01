import ObservedCallsitesStorage from '../test-run/observed-callsites-storage';
import TestController from './test-controller';
import WarningLog from '../notifications/warning-log';

export interface TestRun {
    id: string;
    controller: TestController;
    observedCallsites: ObservedCallsitesStorage;
    warningLog: WarningLog;

    executeAction(apiMethodName: string, command: unknown, callsite: unknown): Promise<unknown>;
}

export interface TestRunTracker {
    activeTestRuns: { [id: string]: TestRun };
    addTrackingMarkerToFunction(testRunId: string, fn: Function): Function;
    ensureEnabled(): void;
    resolveContextTestRun(): TestRun;
}

declare const testRunTracker: TestRunTracker;

export default testRunTracker;

