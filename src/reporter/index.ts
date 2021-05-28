import {
    find,
    sortBy,
    union
} from 'lodash';

import { writable as isWritableStream } from 'is-stream';
import ReporterPluginHost from './plugin-host';
import ReporterPluginMethod from './plugin-methods';
import formatCommand from './command/format-command';
import getBrowser from '../utils/get-browser';
import { ReporterPluginError } from '../errors/runtime';
import Task from '../runner/task';
import { Writable } from 'stream';
import { WriteStream } from 'tty';
import TestRun from '../test-run';
import Test from '../api/structure/test';
import Fixture from '../api/structure/fixture';
import TestRunErrorFormattableAdapter from '../errors/test-run/formattable-adapter';
import CommandBase from '../test-run/commands/base';


interface PendingPromise {
    resolve: Function | null;
    then: Function;
}

interface ReportItem {
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
    browsers: unknown[];
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
}

interface PluginMethodArguments {
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

export default class Reporter {
    public readonly plugin: ReporterPluginHost;
    public readonly task: Task;
    public disposed: boolean;
    public passed: number;
    public failed: number;
    public skipped: number;
    public testCount: number;
    public readonly reportQueue: ReportItem[];
    public readonly stopOnFirstFail: boolean;
    public readonly outStream: Writable;
    public readonly pendingTaskDonePromise: PendingPromise;

    public constructor (plugin: ReporterPluginHost, task: Task, outStream: Writable, name: string) {
        this.plugin = new ReporterPluginHost(plugin, outStream, name);
        this.task   = task;

        this.disposed               = false;
        this.passed                 = 0;
        this.failed                 = 0;
        this.skipped                = 0;
        this.testCount              = task.tests.filter(test => !test.skip).length;
        this.reportQueue            = Reporter._createReportQueue(task);
        this.stopOnFirstFail        = task.opts.stopOnFirstFail as boolean;
        this.outStream              = outStream;
        this.pendingTaskDonePromise = Reporter._createPendingPromise();

        this._assignTaskEventHandlers();
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

    private static _createReportItem (test: Test, runsPerTest: number): ReportItem {
        return {
            fixture:                    test.fixture,
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
            browsers:                   []
        };
    }

    private static _createReportQueue (task: Task): ReportItem[] {
        const runsPerTest = task.browserConnectionGroups.length;

        return task.tests.map(test => Reporter._createReportItem(test, runsPerTest));
    }

    private static _createTestRunInfo (reportItem: ReportItem): TestRunInfo {
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
            testId:         reportItem.test.id
        };
    }

    private _getReportItemForTestRun (testRun: TestRun): ReportItem | undefined {
        return find(this.reportQueue, i => i.test === testRun.test);
    }

    private async _shiftReportQueue (): Promise<void> {
        let currentFixture = null;
        let nextReportItem = null;
        let reportItem     = null;

        while (this.reportQueue.length && this.reportQueue[0].testRunInfo) {
            reportItem     = this.reportQueue.shift() as ReportItem;
            currentFixture = reportItem.fixture;

            // NOTE: here we assume that tests are sorted by fixture.
            // Therefore, if the next report item has a different
            // fixture, we can report this fixture start.
            nextReportItem = this.reportQueue[0];

            await this.dispatchToPlugin({
                method: ReporterPluginMethod.reportTestDone,
                args:   [
                    reportItem.test.name,
                    reportItem.testRunInfo,
                    reportItem.test.meta
                ]
            });

            if (!nextReportItem)
                continue;

            if (nextReportItem.fixture === currentFixture)
                continue;

            await this.dispatchToPlugin({
                method: ReporterPluginMethod.reportFixtureStart,
                args:   [
                    nextReportItem.fixture.name,
                    nextReportItem.fixture.path,
                    nextReportItem.fixture.meta
                ]
            });
        }
    }

    private async _resolveReportItem (reportItem: ReportItem, testRun: TestRun): Promise<void> {
        if (this.task.screenshots.hasCapturedFor(testRun.test)) {
            reportItem.screenshotPath = this.task.screenshots.getPathFor(testRun.test);
            reportItem.screenshots    = this.task.screenshots.getScreenshotsInfo(testRun.test);
        }

        if (this.task.videos)
            reportItem.videos = this.task.videos.getTestVideos(reportItem.test.id);

        if (testRun.quarantine) {
            reportItem.quarantine = testRun.quarantine.attempts.reduce((result: Record<string, object>, errors: TestRunErrorFormattableAdapter[], index: number) => {
                const passed            = !errors.length;
                const quarantineAttempt = index + 1;

                result[quarantineAttempt] = { passed };

                return result;
            }, {});
        }

        if (!reportItem.testRunInfo) {
            reportItem.testRunInfo = Reporter._createTestRunInfo(reportItem);

            if (reportItem.test.skip)
                this.skipped++;
            else if (reportItem.errs.length)
                this.failed++;
            else
                this.passed++;
        }

        await this._shiftReportQueue();

        (reportItem.pendingTestRunDonePromise.resolve as Function)();
    }

    private _prepareReportTestActionEventArgs ({ command, duration, result, testRun, err }: ReportTestActionEventArguments): any {
        const args: any = {};

        if (err)
            args.err = err;

        if (typeof duration === 'number')
            args.duration = duration;

        return Object.assign(args, {
            testRunId: testRun.id,
            test:      {
                id:    testRun.test.id,
                name:  testRun.test.name,
                phase: testRun.phase,
            },
            fixture: {
                name: testRun.test.fixture.name,
                id:   testRun.test.fixture.id
            },
            command: formatCommand(command, result),
            browser: getBrowser(testRun.browserConnection),
        });
    }

    public async dispatchToPlugin ({ method, args = [] }: PluginMethodArguments): Promise<void> {
        try {
            // @ts-ignore
            await this.plugin[method](...args);
        }
        catch (originalError) {
            const uncaughtError = new ReporterPluginError({
                name: this.plugin.name,
                method,
                originalError
            });

            this.task.emit('error', uncaughtError);
        }
    }

    private async _onceTaskStartHandler (): Promise<void> {
        const startTime  = new Date();
        const userAgents = this.task.browserConnectionGroups.map(group => group[0].userAgent);
        const first      = this.reportQueue[0];

        const taskProperties = {
            configuration: this.task.opts
        };

        await this.dispatchToPlugin({
            method: ReporterPluginMethod.reportTaskStart,
            args:   [
                startTime,
                userAgents,
                this.testCount,
                this.task.testStructure,
                taskProperties
            ]
        });

        await this.dispatchToPlugin({
            method: ReporterPluginMethod.reportFixtureStart,
            args:   [
                first.fixture.name,
                first.fixture.path,
                first.fixture.meta
            ]
        });
    }

    private async _onTaskTestRunStartHandler (testRun: TestRun): Promise<unknown> {
        const reportItem = this._getReportItemForTestRun(testRun) as ReportItem;

        reportItem.testRunIds.push(testRun.id);

        if (!reportItem.startTime)
            reportItem.startTime = +new Date();

        reportItem.pendingStarts--;

        if (!reportItem.pendingStarts) {
            // @ts-ignore
            if (this.plugin.reportTestStart) {
                const testStartInfo = { testRunIds: reportItem.testRunIds, testId: reportItem.test.id };

                await this.dispatchToPlugin({
                    method: ReporterPluginMethod.reportTestStart as string,
                    args:   [
                        reportItem.test.name,
                        reportItem.test.meta,
                        testStartInfo
                    ]
                });
            }

            (reportItem.pendingTestRunStartPromise.resolve as Function)();
        }

        return reportItem.pendingTestRunStartPromise;
    }

    private async _onTaskTestRunDoneHandler (testRun: TestRun): Promise<void> {
        const reportItem                    = this._getReportItemForTestRun(testRun) as ReportItem;
        const isTestRunStoppedTaskExecution = !!testRun.errs.length && this.stopOnFirstFail;

        reportItem.pendingRuns = isTestRunStoppedTaskExecution ? 0 : reportItem.pendingRuns - 1;
        reportItem.unstable    = reportItem.unstable || testRun.unstable;
        reportItem.errs        = reportItem.errs.concat(testRun.errs);
        reportItem.warnings    = testRun.warningLog ? union(reportItem.warnings, testRun.warningLog.messages) : [];

        reportItem.browsers.push(Object.assign({ testRunId: testRun.id }, getBrowser(testRun.browserConnection)));

        if (!reportItem.pendingRuns)
            await this._resolveReportItem(reportItem, testRun);

        await reportItem.pendingTestRunDonePromise;
    }

    private async _onTaskTestActionStart ({ apiActionName, ...restArgs }: ReportTaskActionEventArguments): Promise<void> {
        // @ts-ignore
        if (this.plugin.reportTestActionStart) {
            restArgs = this._prepareReportTestActionEventArgs(restArgs as unknown as ReportTestActionEventArguments);

            await this.dispatchToPlugin({
                method: ReporterPluginMethod.reportTestActionStart as string,
                args:   [
                    apiActionName,
                    restArgs
                ]
            });
        }
    }

    private async _onTaskTestActionDone ({ apiActionName, ...restArgs }: ReportTaskActionEventArguments): Promise<void> {
        // @ts-ignore
        if (this.plugin.reportTestActionDone) {
            restArgs = this._prepareReportTestActionEventArgs(restArgs as unknown as ReportTestActionEventArguments);

            await this.dispatchToPlugin({
                method: ReporterPluginMethod.reportTestActionDone as string,
                args:   [
                    apiActionName,
                    restArgs
                ]
            });
        }
    }

    private async _onceTaskDoneHandler (): Promise<void> {
        const endTime = new Date();

        const result = {
            passedCount:  this.passed,
            failedCount:  this.failed,
            skippedCount: this.skipped
        };

        await this.dispatchToPlugin({
            method: ReporterPluginMethod.reportTaskDone,
            args:   [
                endTime,
                this.passed,
                this.task.warningLog.messages,
                result
            ]
        });

        (this.pendingTaskDonePromise.resolve as Function)();
    }

    private _assignTaskEventHandlers (): void {
        const task = this.task;

        task.once('start', async () => await this._onceTaskStartHandler());

        task.on('test-run-start', async testRun => await this._onTaskTestRunStartHandler(testRun));

        task.on('test-run-done', async testRun => await this._onTaskTestRunDoneHandler(testRun));

        task.on('test-action-start', async e => await this._onTaskTestActionStart(e));

        task.on('test-action-done', async e => await this._onTaskTestActionDone(e));

        task.once('done', async () => await this._onceTaskDoneHandler());
    }

    public async dispose (): Promise<unknown> {
        if (this.disposed)
            return Promise.resolve();

        this.disposed = true;

        if (!this.outStream || Reporter._isSpecialStream(this.outStream) || !isWritableStream(this.outStream))
            return Promise.resolve();

        const streamFinishedPromise = new Promise(resolve => {
            this.outStream.once('finish', resolve);
            this.outStream.once('error', resolve);
        });

        this.outStream.end();

        return streamFinishedPromise;
    }
}
