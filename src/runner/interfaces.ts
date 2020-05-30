import CommandBase from '../test-run/commands/base';
import TestRun from '../test-run';
import BrowserConnection from '../browser/connection';
import { Writable as WritableStream } from 'stream';
import ClientScriptInit from '../custom-client-scripts/client-script-init';
import { Metadata } from '../api/structure/interfaces';
import BrowserSet from './browser-set';
import BrowserJob from './browser-job';
import WarningLog from '../notifications/warning-log';
import Test from '../api/structure/test';
import TestedApp from './tested-app';
import ClientScript from '../custom-client-scripts/client-script';
import Screenshots from '../screenshots';

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

export type BrowserSource = BrowserConnection | string;

export type TestSource = string | string[];

export interface ReporterSource {
    name: string;
    output?: string | WritableStream;
}

export type ClientScriptSource = string | ClientScriptInit;

export interface Filter {
    (testName: string, fixtureName: string, fixturePath: string, testMeta: Metadata, fixtureMeta: Metadata): boolean;
}


export type ReporterPlugin = unknown;

export interface ReporterPluginSource {
    plugin: ReporterPlugin;
    outStream?: WritableStream;
}

export interface BrowserConnectionRelatedResources {
    browserSet: BrowserSet;
    browserJobs: BrowserJob[];
    warningLog: WarningLog;
    screenshots: Screenshots;
}

export interface BasicRuntimeResources extends BrowserConnectionRelatedResources {
    tests: Test[];
    testedApp?: TestedApp;
}

export interface RuntimeResources extends BasicRuntimeResources {
    reporterPlugins: ReporterPluginSource[];
    commonClientScripts: ClientScript[];
}
