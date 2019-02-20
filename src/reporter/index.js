import Promise from 'pinkie';
import { find, sortBy, union } from 'lodash';
import { writable as isWritableStream } from 'is-stream';
import ReporterPluginHost from './plugin-host';

export default class Reporter {
    constructor (plugin, task, outStream) {
        this.plugin = new ReporterPluginHost(plugin, outStream);
        this.task   = task;

        this.disposed        = false;
        this.passed          = 0;
        this.failed          = 0;
        this.skipped         = 0;
        this.testCount       = task.tests.filter(test => !test.skip).length;
        this.reportQueue     = Reporter._createReportQueue(task);
        this.stopOnFirstFail = task.opts.stopOnFirstFail;
        this.outStream       = outStream;

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
            fixture:        test.fixture,
            test:           test,
            screenshotPath: null,
            screenshots:    [],
            quarantine:     null,
            errs:           [],
            warnings:       [],
            unstable:       false,
            startTime:      null,
            testRunInfo:    null,

            pendingRuns:    runsPerTest,
            pendingPromise: Reporter._createPendingPromise()
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
            quarantine:     reportItem.quarantine,
            skipped:        reportItem.test.skip
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

            await this.plugin.reportTestDone(reportItem.test.name, reportItem.testRunInfo, reportItem.test.meta);

            // NOTE: here we assume that tests are sorted by fixture.
            // Therefore, if the next report item has a different
            // fixture, we can report this fixture start.
            nextReportItem = this.reportQueue[0];

            if (nextReportItem && nextReportItem.fixture !== currentFixture)
                await this.plugin.reportFixtureStart(nextReportItem.fixture.name, nextReportItem.fixture.path, nextReportItem.fixture.meta);
        }
    }

    async _resolveReportItem (reportItem, testRun) {
        if (this.task.screenshots.hasCapturedFor(testRun.test)) {
            reportItem.screenshotPath = this.task.screenshots.getPathFor(testRun.test);
            reportItem.screenshots    = this.task.screenshots.getScreenshotsInfo(testRun.test);
        }

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

        reportItem.pendingPromise.resolve();
    }

    _assignTaskEventHandlers () {
        const task = this.task;

        task.once('start', async () => {
            const startTime  = new Date();
            const userAgents = task.browserConnectionGroups.map(group => group[0].userAgent);
            const first      = this.reportQueue[0];

            await this.plugin.reportTaskStart(startTime, userAgents, this.testCount);
            await this.plugin.reportFixtureStart(first.fixture.name, first.fixture.path, first.fixture.meta);
        });

        task.on('test-run-start', testRun => {
            const reportItem = this._getReportItemForTestRun(testRun);

            if (!reportItem.startTime)
                reportItem.startTime = new Date();
        });

        task.on('test-run-done', async testRun => {
            const reportItem                    = this._getReportItemForTestRun(testRun);
            const isTestRunStoppedTaskExecution = !!testRun.errs.length && this.stopOnFirstFail;

            reportItem.pendingRuns = isTestRunStoppedTaskExecution ? 0 : reportItem.pendingRuns - 1;
            reportItem.unstable    = reportItem.unstable || testRun.unstable;
            reportItem.errs        = reportItem.errs.concat(testRun.errs);
            reportItem.warnings    = testRun.warningLog ? union(reportItem.warnings, testRun.warningLog.messages) : [];

            if (!reportItem.pendingRuns)
                await this._resolveReportItem(reportItem, testRun);

            await reportItem.pendingPromise;
        });

        task.once('done', async () => {
            const endTime = new Date();

            const result = {
                passedCount:  this.passed,
                failedCount:  this.failed,
                skippedCount: this.skipped
            };

            await this.plugin.reportTaskDone(endTime, this.passed, task.warningLog.messages, result);
        });
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
