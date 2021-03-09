import CommandBase from '../test-run/commands/base';
import TestRun from '../test-run';
import WarningLog from '../notifications/warning-log';
import { Writable as WritableStream } from 'stream';
import BrowserConnection from '../browser/connection';

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

export interface ReporterInit {
    name: string;
    output?: string | WritableStream;
}

export type BrowserInit = string | object | BrowserConnection;
