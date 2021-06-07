import TestRun from '../../../../../test-run';

export type ObservationConstructor = (new (init: object, testRun: TestRun) => any);
export type ActionConstructor = (new (init: object, testRun: TestRun, validateProperties: boolean) => any);
export type CommandConstructor = ObservationConstructor | ActionConstructor;
