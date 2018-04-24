import { find, sortBy } from 'lodash';
import ReporterPluginHost from './plugin-host';

export default class Reporter {
    constructor (plugin, task, outStream) {
        this.plugin = new ReporterPluginHost(plugin, outStream);

        this.passed      = 0;
        this.skipped     = task.tests.filter(test => test.skip).length;
        this.testCount   = task.tests.length - this.skipped;
        this.reportQueue = Reporter._createReportQueue(task);

        this._assignTaskEventHandlers(task);
    }

    // Static
    static _createReportQueue (task) {
        var runsPerTest = task.browserConnectionGroups.length;

        return task.tests.map(test => Reporter._createReportItem(test, runsPerTest));
    }

    static _createReportItem (test, runsPerTest) {
        return {
            fixture:        test.fixture,
            test:           test,
            screenshotPath: null,
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
            skipped:        reportItem.test.skip
        };
    }

    _getReportItemForTestRun (testRun) {
        return find(this.reportQueue, i => i.test === testRun.test);
    }

    _shiftReportQueue (reportItem) {
        var currentFixture = null;
        var nextReportItem = null;

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
            var startTime  = new Date();
            var userAgents = task.browserConnectionGroups.map(group => group[0].userAgent);
            var first      = this.reportQueue[0];

            this.plugin.reportTaskStart(startTime, userAgents, this.testCount);
            this.plugin.reportFixtureStart(first.fixture.name, first.fixture.path, first.fixture.meta);
        });

        task.on('test-run-start', testRun => {
            var reportItem = this._getReportItemForTestRun(testRun);

            if (!reportItem.startTime)
                reportItem.startTime = new Date();
        });

        task.on('test-run-done', testRun => {
            var reportItem = this._getReportItemForTestRun(testRun);

            reportItem.pendingRuns--;
            reportItem.unstable = reportItem.unstable || testRun.unstable;
            reportItem.errs     = reportItem.errs.concat(testRun.errs);

            if (!reportItem.pendingRuns) {
                if (task.screenshots.hasCapturedFor(testRun.test))
                    reportItem.screenshotPath = task.screenshots.getPathFor(testRun.test);

                if (!reportItem.testRunInfo) {
                    reportItem.testRunInfo = Reporter._createTestRunInfo(reportItem);

                    if (!reportItem.errs.length && !reportItem.test.skip)
                        this.passed++;
                }

                this._shiftReportQueue(reportItem);
            }
        });

        task.once('done', () => {
            var endTime = new Date();

            this.plugin.reportTaskDone(endTime, this.passed, task.warningLog.messages);
        });
    }
}
