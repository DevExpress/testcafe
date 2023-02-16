import {
    find,
    sortBy,
    union,
    isFunction,
} from 'lodash';

import { writable as isWritableStream } from 'is-stream';
import ReporterPluginHost from './plugin-host';
import ReporterPluginMethod from './plugin-methods';
import formatCommand from './command/format-command';
import { ReporterPluginError } from '../errors/runtime';
import Task from '../runner/task';
import { Writable as WritableStream, Writable } from 'stream';
import { WriteStream } from 'tty';
import TestRun from '../test-run';
import Test from '../api/structure/test';
import Fixture from '../api/structure/fixture';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';
import { CommandBase } from '../test-run/commands/base';

import {
    ReporterPlugin,
    ReporterPluginSource,
    ReporterSource,
} from './interfaces';

import { getPluginFactory, processReporterName } from '../utils/reporter';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';
import makeDir from 'make-dir';
import path from 'path';
import fs from 'fs';
import MessageBus from '../utils/message-bus';
import BrowserConnection from '../browser/connection';
import { Dictionary } from '../configuration/interfaces';
import debug from 'debug';

interface PendingPromise {
    resolve: Function | null;
    then: Function;
}

interface TaskInfo {
    task: Task | null;
    passed: number;
    failed: number;
    skipped: number;
    testCount: number;
    testQueue: TestInfo[];
    readonly stopOnFirstFail: boolean;
    readonly pendingTaskDonePromise: PendingPromise;
}

interface TestInfo {
    fixture: Fixture;
    test: Test;
    testRunIds: string[];
    screenshotPath: null | string;
    screenshots: unknown[];
    videos: unknown[];
    quarantine: null | Record<string, object>;
    errs: TestRunErrorFormattableAdapter[];
    warnings: string[];
    unstable: boolean;
    startTime: null | number;
    testRunInfo: null | TestRunInfo;
    pendingRuns: number;
    pendingStarts: number;
    pendingTestRunDonePromise: PendingPromise;
    pendingTestRunStartPromise: PendingPromise;
    browsers: BrowserRunInfo[];
}

interface FixtureInfo {
    id: string;
    name: string | null;
    path: string;
    meta: Dictionary<string>;
}

interface BrowserRunInfo extends Browser {
    testRunId: string;
    quarantineAttemptsTestRunIds?: string[];
}

interface TestRunInfo {
    errs: TestRunErrorFormattableAdapter[];
    warnings: string[];
    durationMs: number;
    unstable: boolean;
    screenshotPath: string;
    screenshots: unknown;
    videos: unknown;
    quarantine: unknown;
    skipped: boolean;
    browsers: unknown[];
    testId: string;
    fixture: FixtureInfo;
}

interface PluginMethodArguments {
    initialObject: Task | MessageBus | null;
    method: string;
    args: unknown[];
}

interface ReportTestActionEventArguments {
    command: CommandBase;
    duration: number;
    result: unknown;
    testRun: TestRun;
    err: TestRunErrorFormattableAdapter;
}

interface ReportTaskActionEventArguments {
    apiActionName: string;
    restArgs: object;
}

interface ReportWarningEventArguments {
    message: string;
    testRun?: TestRun;
    actionId?: string;
}

const debugLog = debug('testcafe:reporter');

export default class Reporter {
    public readonly plugin: ReporterPluginHost;
    public readonly messageBus: MessageBus;
    public disposed: boolean;
    public taskInfo: TaskInfo | null;
    public readonly outStream: Writable;

    public constructor (plugin: ReporterPlugin, messageBus: MessageBus, outStream: Writable, name: string) {
        this.plugin     = new ReporterPluginHost(plugin, outStream, name);
        this.messageBus = messageBus;

        this.disposed  = false;
        this.taskInfo  = null;
        this.outStream = outStream;

        this._assignMessageBusEventHandlers();
    }

    private static _isSpecialStream (stream: Writable): boolean {
        return (stream as WriteStream).isTTY || stream === process.stdout || stream === process.stderr;
    }

    private static _createPendingPromise (): PendingPromise {
        let resolver = null;

        const promise = new Promise(resolve => {
            resolver = resolve;
        }) as unknown as PendingPromise;

        promise.resolve = resolver;

        return promise;
    }

    public async init (): Promise<void> {
        await this.dispatchToPlugin({
            method:        ReporterPluginMethod.init,
            initialObject: null,
            args:          [{}],
        });
    }

    public async dispatchToPlugin ({ method, initialObject, args = [] }: PluginMethodArguments): Promise<void> {
        try {
            // @ts-ignore
            await this.plugin[method](...args);
        }
        catch (originalError) {
            const uncaughtError = new ReporterPluginError({
                name: this.plugin.name,
                method,
                originalError,
            });

            debugLog('Plugin error: %O', uncaughtError);
            debugLog('Plugin error: initialObject: %O', initialObject);

            if (initialObject)
                await initialObject.emit('error', uncaughtError);
            else
                throw uncaughtError;
        }
    }

    private _assignMessageBusEventHandlers (): void {
        const messageBus = this.messageBus;

        messageBus.on('warning-add', async e => await this._onWarningAddHandler(e));

        messageBus.once('start', async (task: Task) => await this._onceTaskStartHandler(task));

        messageBus.on('test-run-start', async testRun => await this._onTaskTestRunStartHandler(testRun));

        messageBus.on('test-run-done', async testRun => await this._onTaskTestRunDoneHandler(testRun));

        messageBus.on('test-action-start', async e => await this._onTaskTestActionStart(e));

        messageBus.on('test-action-done', async e => await this._onTaskTestActionDone(e));

        messageBus.once('done', async () => await this._onceTaskDoneHandler());

        messageBus.once('unhandled-rejection', async () => await this._onceTaskDoneHandler());
    }

    public async dispose (): Promise<unknown> {
        if (this.disposed)
            return Promise.resolve();

        this.disposed = true;

        if (!isFunction(this?.outStream?.once)
            || Reporter._isSpecialStream(this.outStream)
            || !isWritableStream(this.outStream))
            return Promise.resolve();

        const streamFinishedPromise = new Promise(resolve => {
            this.outStream.once('finish', resolve);
            this.outStream.once('error', resolve);
        });

        this.outStream.end();

        return streamFinishedPromise;
    }

    private static async _ensureOutStream (outStream: string | WritableStream): Promise<WritableStream> {
        if (typeof outStream !== 'string')
            return outStream;

        const fullReporterOutputPath = resolvePathRelativelyCwd(outStream);

        await makeDir(path.dirname(fullReporterOutputPath));

        return fs.createWriteStream(fullReporterOutputPath);
    }

    private static _addDefaultReporter (reporters: ReporterSource[]): void {
        reporters.push({
            name:   'spec',
            output: process.stdout,
        });
    }

    public static async getReporterPlugins (reporters: ReporterSource[] = []): Promise<ReporterPluginSource[]> {
        if (!reporters.length)
            Reporter._addDefaultReporter(reporters);

        return Promise.all(reporters.map(async ({ name, output, options }) => {
            const pluginFactory = getPluginFactory(name);
            const processedName = processReporterName(name);
            const outStream     = output ? await Reporter._ensureOutStream(output) : void 0;

            return {
                plugin: pluginFactory(options),
                name:   processedName,
                outStream,
            };
        }));
    }

    private async _onWarningAddHandler ({ message, testRun, actionId }: ReportWarningEventArguments): Promise<void> {
        await this.dispatchToPlugin({
            method:        ReporterPluginMethod.reportWarnings as string,
            initialObject: this.messageBus,
            args:          [
                {
                    message,
                    testRunId: testRun?.id,
                    actionId,
                },
            ],
        });
    }

    //Task
    private static _createTestItem (test: Test, runsPerTest: number): TestInfo {
        return {
            fixture:                    test.fixture as Fixture,
            test:                       test,
            testRunIds:                 [],
            screenshotPath:             null,
            screenshots:                [],
            videos:                     [],
            quarantine:                 null,
            errs:                       [],
            warnings:                   [],
            unstable:                   false,
            startTime:                  null,
            testRunInfo:                null,
            pendingRuns:                runsPerTest,
            pendingStarts:              runsPerTest,
            pendingTestRunDonePromise:  Reporter._createPendingPromise(),
            pendingTestRunStartPromise: Reporter._createPendingPromise(),
            browsers:                   [],
        };
    }

    private static _createTestQueue (task: Task): TestInfo[] {
        const runsPerTest = task.browserConnectionGroups.length;

        return task.tests.map(test => Reporter._createTestItem(test, runsPerTest));
    }

    private static _createTestRunInfo (reportItem: TestInfo): TestRunInfo {
        return {
            errs:           sortBy(reportItem.errs, ['userAgent', 'code']),
            warnings:       reportItem.warnings,
            durationMs:     +new Date() - (reportItem.startTime as number), //eslint-disable-line  @typescript-eslint/no-extra-parens
            unstable:       reportItem.unstable,
            screenshotPath: reportItem.screenshotPath as string,
            screenshots:    reportItem.screenshots,
            videos:         reportItem.videos,
            quarantine:     reportItem.quarantine,
            skipped:        reportItem.test.skip,
            browsers:       reportItem.browsers,
            testId:         reportItem.test.id,
            fixture:        {
                id:   reportItem.fixture.id,
                name: reportItem.fixture.name,
                path: reportItem.fixture.path,
                meta: reportItem.fixture.meta,
            },
        };
    }

    private _getTestItemForTestRun (taskInfo: TaskInfo, testRun: TestRun): TestInfo | undefined {
        return find(taskInfo.testQueue, i => i.test === testRun.test);
    }

    private async _shiftTestQueue (): Promise<void> {
        if (!this.taskInfo)
            return;

        let currentFixture = null;
        let nextReportItem = null;
        let testItem       = null;
        const testQueue    = this.taskInfo.testQueue;

        while (testQueue.length && testQueue[0].testRunInfo) {
            testItem       = testQueue.shift() as TestInfo;
            currentFixture = testItem.fixture;

            // NOTE: here we assume that tests are sorted by fixture.
            // Therefore, if the next report item has a different
            // fixture, we can report this fixture start.
            nextReportItem = testQueue[0];

            await this.dispatchToPlugin({
                method:        ReporterPluginMethod.reportTestDone,
                initialObject: this.taskInfo.task,
                args:          [
                    testItem.test.name,
                    testItem.testRunInfo,
                    testItem.test.meta,
                ],
            });

            if (!nextReportItem || nextReportItem.fixture === currentFixture)
                continue;

            await this.dispatchToPlugin({
                method:        ReporterPluginMethod.reportFixtureStart,
                initialObject: this.taskInfo.task,
                args:          [
                    nextReportItem.fixture.name,
                    nextReportItem.fixture.path,
                    nextReportItem.fixture.meta,
                ],
            });
        }
    }

    private async _resolveTestItem (taskInfo: TaskInfo, testItem: TestInfo, testRun: TestRun): Promise<void> {
        if (!taskInfo.task)
            return;

        if (taskInfo.task.screenshots.hasCapturedFor(testRun.test)) {
            testItem.screenshotPath = taskInfo.task.screenshots.getPathFor(testRun.test);
            testItem.screenshots    = taskInfo.task.screenshots.getScreenshotsInfo(testRun.test);
        }

        if (taskInfo.task.videos)
            testItem.videos = taskInfo.task.videos.getTestVideos(testItem.test.id);

        if (testRun.quarantine) {
            const testItemQuarantine = testRun.quarantine.attempts.reduce((result: Record<string, object>, { errors }, index: number) => {
                const passed            = !errors.length;
                const quarantineAttempt = index + 1;

                result[quarantineAttempt] = { passed };

                return result;
            }, { });

            Object.assign(testItem.quarantine as object, testItemQuarantine);
        }

        if (!testItem.testRunInfo) {
            testItem.testRunInfo = Reporter._createTestRunInfo(testItem);

            if (testItem.test.skip)
                taskInfo.skipped++;
            else if (testItem.errs.length)
                taskInfo.failed++;
            else
                taskInfo.passed++;
        }

        await this._shiftTestQueue();

        (testItem.pendingTestRunDonePromise.resolve as Function)();
    }

    private _prepareReportTestActionEventArgs ({ command, duration, result, testRun, err }: ReportTestActionEventArguments): any {
        const args: any = {};

        if (err)
            args.err = err;

        if (typeof duration === 'number')
            args.duration = duration;

        const testFixture = testRun.test.fixture as Fixture;

        return Object.assign(args, {
            testRunId: testRun.id,
            test:      {
                id:    testRun.test.id,
                name:  testRun.test.name,
                phase: testRun.phase,
            },
            fixture: {
                name: testFixture.name,
                id:   testFixture.id,
            },
            command: formatCommand(command, result),
            browser: testRun.browser,
        });
    }


    private async _onceTaskStartHandler (task: Task): Promise<void> {
        this.taskInfo = {
            task:                   task,
            passed:                 0,
            failed:                 0,
            skipped:                0,
            testCount:              task.tests.filter(test => !test.skip).length,
            testQueue:              Reporter._createTestQueue(task),
            stopOnFirstFail:        task.opts.stopOnFirstFail as boolean,
            pendingTaskDonePromise: Reporter._createPendingPromise(),
        };

        const startTime              = task.startTime;
        const browserConnectionsInfo = ([] as BrowserConnection[])
            .concat(...task.browserConnectionGroups)
            .map(connection => connection.connectionInfo);
        const first                  = this.taskInfo.testQueue[0];

        const taskProperties = {
            configuration: task.opts,
            dashboardUrl:  task.opts.dashboardUrl,
        };

        await this.dispatchToPlugin({
            method:        ReporterPluginMethod.reportTaskStart,
            initialObject: task,
            args:          [
                startTime,
                browserConnectionsInfo,
                this.taskInfo.testCount,
                task.testStructure,
                taskProperties,
            ],
        });

        if (first) {
            await this.dispatchToPlugin({
                method:        ReporterPluginMethod.reportFixtureStart,
                initialObject: task,
                args:          [
                    first.fixture.name,
                    first.fixture.path,
                    first.fixture.meta,
                ],
            });
        }
    }

    private async _onTaskTestRunStartHandler (testRun: TestRun): Promise<unknown> {
        if (!this.taskInfo)
            return void 0;

        const testItem = this._getTestItemForTestRun(this.taskInfo, testRun) as TestInfo;

        testItem.testRunIds.push(testRun.id);

        if (!testItem.startTime)
            testItem.startTime = +new Date();

        testItem.pendingStarts--;

        if (!testItem.pendingStarts) {
            // @ts-ignore
            if (this.plugin.reportTestStart) {
                const testStartInfo = {
                    testRunIds: testItem.testRunIds,
                    testId:     testItem.test.id,
                    startTime:  new Date(testItem.startTime),
                    skipped:    testItem.test.skip,
                };

                await this.dispatchToPlugin({
                    method:        ReporterPluginMethod.reportTestStart as string,
                    initialObject: this.taskInfo.task,
                    args:          [
                        testItem.test.name,
                        testItem.test.meta,
                        testStartInfo,
                    ],
                });
            }

            (testItem.pendingTestRunStartPromise.resolve as Function)();
        }

        return testItem.pendingTestRunStartPromise;
    }

    private async _onTaskTestRunDoneHandler (testRun: TestRun): Promise<void> {
        if (!this.taskInfo)
            return;

        const reportItem                    = this._getTestItemForTestRun(this.taskInfo, testRun) as TestInfo;
        const isTestRunStoppedTaskExecution = !!testRun.errs.length && this.taskInfo.stopOnFirstFail;
        const browser: BrowserRunInfo       = Object.assign({ testRunId: testRun.id }, testRun.browser);

        reportItem.browsers.push(browser);

        reportItem.pendingRuns = isTestRunStoppedTaskExecution ? 0 : reportItem.pendingRuns - 1;
        reportItem.unstable    = reportItem.unstable || testRun.unstable;
        reportItem.errs        = reportItem.errs.concat(testRun.errs);
        reportItem.warnings    = testRun.warningLog ? union(reportItem.warnings, testRun.warningLog.messages) : [];

        if (testRun.quarantine) {
            reportItem.quarantine = reportItem.quarantine || {};

            const reportItemQuarantine = testRun.quarantine.attempts.reduce((result: Record<string, object>, { errors, testRunId }) => {
                const passed = !errors.length;

                result[testRunId]                    = { passed, errors };
                browser.quarantineAttemptsTestRunIds = browser.quarantineAttemptsTestRunIds || [];

                browser.quarantineAttemptsTestRunIds.push(testRunId);

                return result;
            }, {});

            Object.assign(reportItem.quarantine, reportItemQuarantine);
        }

        if (!reportItem.pendingRuns)
            await this._resolveTestItem(this.taskInfo, reportItem, testRun);

        await reportItem.pendingTestRunDonePromise;
    }

    private async _onTaskTestActionStart ({ apiActionName, ...restArgs }: ReportTaskActionEventArguments): Promise<void> {
        if (!this.taskInfo)
            return;

        // @ts-ignore
        if (this.plugin.reportTestActionStart) {
            restArgs = this._prepareReportTestActionEventArgs(restArgs as unknown as ReportTestActionEventArguments);

            await this.dispatchToPlugin({
                method:        ReporterPluginMethod.reportTestActionStart as string,
                initialObject: this.taskInfo.task,
                args:          [
                    apiActionName,
                    restArgs,
                ],
            });
        }
    }

    private async _onTaskTestActionDone ({ apiActionName, ...restArgs }: ReportTaskActionEventArguments): Promise<void> {
        if (!this.taskInfo)
            return;

        // @ts-ignore
        if (this.plugin.reportTestActionDone) {
            restArgs = this._prepareReportTestActionEventArgs(restArgs as unknown as ReportTestActionEventArguments);

            await this.dispatchToPlugin({
                method:        ReporterPluginMethod.reportTestActionDone as string,
                initialObject: this.taskInfo.task,
                args:          [
                    apiActionName,
                    restArgs,
                ],
            });
        }
    }

    private async _onceTaskDoneHandler (): Promise<void> {
        if (!this.taskInfo)
            return;

        const endTime = new Date();

        const result = {
            passedCount:  this.taskInfo.passed,
            failedCount:  this.taskInfo.failed,
            skippedCount: this.taskInfo.skipped,
        };

        await this.dispatchToPlugin({
            method:        ReporterPluginMethod.reportTaskDone,
            initialObject: this.taskInfo.task,
            args:          [
                endTime,
                this.taskInfo.passed,
                this.taskInfo.task?.warningLog.messages,
                result,
            ],
        });

        (this.taskInfo.pendingTaskDonePromise.resolve as Function)();
    }
}
