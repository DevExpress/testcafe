import CommandBase from '../test-run/commands/base';
import TestRun from '../test-run';
import WarningLog from '../notifications/warning-log';
import { Writable as WritableStream } from 'stream';
import BrowserConnection from '../browser/connection';
import BrowserConnectionGateway from '../browser/connection/gateway';
import CompilerService from '../services/compiler/host';
import Test from '../api/structure/test';
import { Proxy } from 'testcafe-hammerhead';
import { Dictionary } from '../configuration/interfaces';
import FixtureHookController from './fixture-hook-controller';
import Screenshots from '../screenshots';
import Capturer from '../screenshots/capturer';

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

export interface BootstrapperInit {
    browserConnectionGateway: BrowserConnectionGateway;
    compilerService?: CompilerService;
}

export interface BrowserJobInit {
    tests: Test[];
    browserConnections: BrowserConnection[];
    proxy: Proxy;
    screenshots: Screenshots;
    warningLog: WarningLog;
    fixtureHookController: FixtureHookController;
    opts: Dictionary<OptionValue>;
    compilerService?: CompilerService;
}

export interface TaskInit {
    tests: Test[];
    browserConnectionGroups: BrowserConnection[][];
    proxy: Proxy;
    opts: Dictionary<OptionValue>;
    runnerWarningLog: WarningLog;
    compilerService?: CompilerService;
}

export interface TestRunControllerInit {
    test: Test;
    index: number;
    proxy: Proxy;
    screenshots: Screenshots;
    warningLog: WarningLog;
    fixtureHookController: FixtureHookController;
    opts: Dictionary<OptionValue>;
    compilerService?: CompilerService;
}

export interface TestRunInit {
    test: Test;
    browserConnection: BrowserConnection;
    screenshotCapturer: Capturer;
    globalWarningLog: WarningLog;
    opts: Dictionary<OptionValue>;
    compilerService?: CompilerService;
}
