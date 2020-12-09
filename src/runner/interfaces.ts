import CommandBase from '../test-run/commands/base';
import TestRun from '../test-run';
import WarningLog from '../notifications/warning-log';

export interface ActionEventArg {
    apiActionName: string;
    command: CommandBase;
    testRun?: TestRun;
}

interface ReportedTestItem {
    id: string;
    name: string;
    skip: boolean;
}

interface ReportedFixtureItem {
    id: string;
    name: string;
    tests: ReportedTestItem[];
}

export interface ReportedTestStructureItem {
    fixture: ReportedFixtureItem;
}

export interface BrowserSetOptions {
    concurrency: number;
    browserInitTimeout?: number;
    warningLog: WarningLog;
}
