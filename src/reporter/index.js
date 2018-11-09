import Promise from 'pinkie';
import { find, sortBy } from 'lodash';
import { writable as isWritableStream } from 'is-stream';
import ReporterPluginHost from './plugin-host';

export default class Reporter {
    constructor (plugin, task, outStream) {
        this.plugin = new ReporterPluginHost(plugin, outStream);

        this.disposed        = false;
        this.passed          = 0;
        this.skipped         = task.tests.filter(test => test.skip).length;
        this.testCount       = task.tests.length - this.skipped;
        this.reportQueue     = Reporter._createReportQueue(task);
        this.stopOnFirstFail = task.opts.stopOnFirstFail;
        this.outStream       = outStream;

        this._assignTaskEventHandlers(task);
    }

    static _createReportQueue (task) {
        const runsPerTest = task.browserConnectionGroups.length;

        return task.tests.map(test => Reporter._createReportItem(test, runsPerTest));
    }

    static _createReportItem (test, runsPerTest) {
        return {
            fixture:        test.fixture,
            test:           test,
            screenshotPath: null,
            screenshots:    [],
            quarantine:     null,
            pendingRuns:    runsPerTest,
            errs:           [],
            unstable:       false,
            startTime:      null,
            testRunInfo:    null
        };
    }

    static _createTestRunInfo (reportItem) {
        return {
            errs:           sortBy(reportItem.errs, ['userAgent', 'type']),
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

    _shiftReportQueue (reportItem) {
        let currentFixture = null;
        let nextReportItem = null;

        while (this.reportQueue.length && this.reportQueue[0].testRunInfo) {
            reportItem     = this.reportQueue.shift();
            currentFixture = reportItem.fixture;

            this.plugin.reportTestDone(reportItem.test.name, reportItem.testRunInfo, reportItem.test.meta);

            // NOTE: here we assume that tests are sorted by fixture.
            // Therefore, if the next report item has a different
            // fixture, we can report this fixture start.
            nextReportItem = this.reportQueue[0];

            if (nextReportItem && nextReportItem.fixture !== currentFixture)
                this.plugin.reportFixtureStart(nextReportItem.fixture.name, nextReportItem.fixture.path, nextReportItem.fixture.meta);
        }
    }

    _assignTaskEventHandlers (task) {
        task.once('start', () => {
            const startTime  = new Date();
            const userAgents = task.browserConnectionGroups.map(group => group[0].userAgent);
            const first      = this.reportQueue[0];

            this.plugin.reportTaskStart(startTime, userAgents, this.testCount);
            this.plugin.reportFixtureStart(first.fixture.name, first.fixture.path, first.fixture.meta);
        });

        task.on('test-run-start', testRun => {
            const reportItem = this._getReportItemForTestRun(testRun);

            if (!reportItem.startTime)
                reportItem.startTime = new Date();
        });

        task.on('test-run-done', testRun => {
            const reportItem                    = this._getReportItemForTestRun(testRun);
            const isTestRunStoppedTaskExecution = !!testRun.errs.length && this.stopOnFirstFail;

            reportItem.pendingRuns = isTestRunStoppedTaskExecution ? 0 : reportItem.pendingRuns - 1;
            reportItem.unstable    = reportItem.unstable || testRun.unstable;
            reportItem.errs        = reportItem.errs.concat(testRun.errs);

            if (!reportItem.pendingRuns) {
                if (task.screenshots.hasCapturedFor(testRun.test)) {
                    reportItem.screenshotPath = task.screenshots.getPathFor(testRun.test);
                    reportItem.screenshots    = task.screenshots.getScreenshotsInfo(testRun.test);
                }

                if (testRun.quarantine) {
                    reportItem.quarantine = testRun.quarantine.attempts.reduce((result, errors, index) => {
                        const passed              = !errors.length;
                        const quarantineAttempt = index + 1;

                        result[quarantineAttempt] = { passed };

                        return result;
                    }, {});
                }

                if (!reportItem.testRunInfo) {
                    reportItem.testRunInfo = Reporter._createTestRunInfo(reportItem);

                    if (!reportItem.errs.length && !reportItem.test.skip)
                        this.passed++;
                }

                this._shiftReportQueue(reportItem);
            }
        });

        task.once('done', () => {
            const endTime = new Date();

            this.plugin.reportTaskDone(endTime, this.passed, task.warningLog.messages);
        });
    }

    async dispose () {
        if (this.disposed)
            return;

        this.disposed = true;

        if (!isWritableStream(this.outStream))
            return;

        this.outStream.end();

        await new Promise(resolve => {
            this.outStream.once('finish', resolve);
            this.outStream.once('error', resolve);
        });
    }
}
