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

export default class Reporter {
    constructor (plugin, task, outStream, name) {
        this.plugin = new ReporterPluginHost(plugin, outStream, name);
        this.task   = task;

        this.disposed        = false;
        this.passed          = 0;
        this.failed          = 0;
        this.skipped         = 0;
        this.testCount       = task.tests.filter(test => !test.skip).length;
        this.reportQueue     = Reporter._createReportQueue(task);
        this.stopOnFirstFail = task.opts.stopOnFirstFail;
        this.outStream       = outStream;

        this.pendingTaskDonePromise = Reporter._createPendingPromise();

        this._assignTaskEventHandlers();
    }

    static _isSpecialStream (stream) {
        return stream.isTTY || stream === process.stdout || stream === process.stderr;
    }

    static _createPendingPromise () {
        let resolver = null;

        const promise = new Promise(resolve => {
            resolver = resolve;
        });

        promise.resolve = resolver;

        return promise;
    }

    static _createReportItem (test, runsPerTest) {
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

    static _createReportQueue (task) {
        const runsPerTest = task.browserConnectionGroups.length;

        return task.tests.map(test => Reporter._createReportItem(test, runsPerTest));
    }

    static _createTestRunInfo (reportItem) {
        return {
            errs:           sortBy(reportItem.errs, ['userAgent', 'code']),
            warnings:       reportItem.warnings,
            durationMs:     new Date() - reportItem.startTime,
            unstable:       reportItem.unstable,
            screenshotPath: reportItem.screenshotPath,
            screenshots:    reportItem.screenshots,
            videos:         reportItem.videos,
            quarantine:     reportItem.quarantine,
            skipped:        reportItem.test.skip,
            browsers:       reportItem.browsers,
            testId:         reportItem.test.id
        };
    }

    _getReportItemForTestRun (testRun) {
        return find(this.reportQueue, i => i.test === testRun.test);
    }

    async _shiftReportQueue (reportItem) {
        let currentFixture = null;
        let nextReportItem = null;

        while (this.reportQueue.length && this.reportQueue[0].testRunInfo) {
            reportItem     = this.reportQueue.shift();
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

    async _resolveReportItem (reportItem, testRun) {
        if (this.task.screenshots.hasCapturedFor(testRun.test)) {
            reportItem.screenshotPath = this.task.screenshots.getPathFor(testRun.test);
            reportItem.screenshots    = this.task.screenshots.getScreenshotsInfo(testRun.test);
        }

        if (this.task.videos)
            reportItem.videos = this.task.videos.getTestVideos(reportItem.test.id);

        if (testRun.quarantine) {
            reportItem.quarantine = testRun.quarantine.attempts.reduce((result, errors, index) => {
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

        await this._shiftReportQueue(reportItem);

        reportItem.pendingTestRunDonePromise.resolve();
    }

    _prepareReportTestActionEventArgs ({ command, duration, result, testRun, err }) {
        const args = {};

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
            browser: testRun.controller.browser,
        });
    }

    async dispatchToPlugin ({ method, args = [] }) {
        try {
            await this.plugin[method](...args);
        }
        catch (originalError) {
            const uncaughError = new ReporterPluginError({
                name: this.plugin.name,
                method,
                originalError
            });

            this.task.emit('error', uncaughError);
        }
    }

    async _onceTaskStartHandler () {
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

    async _onTaskTestRunStartHandler (testRun) {
        const reportItem = this._getReportItemForTestRun(testRun);

        reportItem.testRunIds.push(testRun.id);

        if (!reportItem.startTime)
            reportItem.startTime = new Date();

        reportItem.pendingStarts--;

        if (!reportItem.pendingStarts) {
            if (this.plugin.reportTestStart) {
                const testStartInfo = { testRunIds: reportItem.testRunIds, testId: reportItem.test.id };

                await this.dispatchToPlugin({
                    method: ReporterPluginMethod.reportTestStart,
                    args:   [
                        reportItem.test.name,
                        reportItem.test.meta,
                        testStartInfo
                    ]
                });
            }

            reportItem.pendingTestRunStartPromise.resolve();
        }

        return reportItem.pendingTestRunStartPromise;
    }

    async _onTaskTestRunDoneHandler (testRun) {
        const reportItem                    = this._getReportItemForTestRun(testRun);
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

    async _onTaskTestActionStart ({ apiActionName, ...restArgs }) {
        if (this.plugin.reportTestActionStart) {
            restArgs = this._prepareReportTestActionEventArgs(restArgs);

            await this.dispatchToPlugin({
                method: ReporterPluginMethod.reportTestActionStart,
                args:   [
                    apiActionName,
                    restArgs
                ]
            });
        }
    }

    async _onTaskTestActionDone ({ apiActionName, ...restArgs }) {
        if (this.plugin.reportTestActionDone) {
            restArgs = this._prepareReportTestActionEventArgs(restArgs);

            await this.dispatchToPlugin({
                method: ReporterPluginMethod.reportTestActionDone,
                args:   [
                    apiActionName,
                    restArgs
                ]
            });
        }
    }

    async _onceTaskDoneHandler () {
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

        this.pendingTaskDonePromise.resolve();
    }

    _assignTaskEventHandlers () {
        const task = this.task;

        task.once('start', async () => await this._onceTaskStartHandler());

        task.on('test-run-start', async testRun => await this._onTaskTestRunStartHandler(testRun));

        task.on('test-run-done', async testRun => await this._onTaskTestRunDoneHandler(testRun));

        task.on('test-action-start', async e => await this._onTaskTestActionStart(e));

        task.on('test-action-done', async e => await this._onTaskTestActionDone(e));

        task.once('done', async () => await this._onceTaskDoneHandler());
    }

    async dispose () {
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
