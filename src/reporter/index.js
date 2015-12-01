import find from 'array-find';
import ReporterPluginHost from './plugin-host';

export default class Reporter {
    constructor (plugin, task, outStream) {
        this.plugin = new ReporterPluginHost(plugin, outStream);

        this.passed      = 0;
        this.testCount   = task.tests.length;
        this.reportQueue = Reporter._createReportQueue(task);

        this._assignTaskEventHandlers(task);
    }

    // Static
    static _createReportQueue (task) {
        var runsPerTest = task.browserConnections.length;

        return task.tests.map(test => Reporter._createReportItem(test, runsPerTest));
    }

    static _createReportItem (test, runsPerTest) {
        return {
            fixtureName:    test.fixture.name,
            fixturePath:    test.fixture.path,
            testName:       test.name,
            screenshotPath: null,
            pendingRuns:    runsPerTest,
            errs:           [],
            unstable:       false,
            startTime:      null
        };
    }

    static _errorSorter (errs) {
        errs.sort((err1, err2) => {
            err1 = err1.userAgent + err1.type;
            err2 = err2.userAgent + err2.type;

            if (err1 > err2) return 1;
            if (err1 < err2) return -1;
            return 0;
        });
    }

    _getReportItemForTestRun (testRun) {
        var test = testRun.test;

        return find(this.reportQueue, i => i.fixturePath === test.fixture.path && i.testName === test.name);
    }

    _shiftReportQueue () {
        // NOTE: a completed report item is always at the front of the queue.
        // This happens because the next test can't be completed until the
        // previous one frees all browser connections.
        // Therefore, tests always get completed sequentially.
        var reportItem = this.reportQueue.shift();
        var durationMs = new Date() - reportItem.startTime;

        if (!reportItem.errs.length)
            this.passed++;

        Reporter._errorSorter(reportItem.errs);

        this.plugin.reportTestDone(reportItem.testName, reportItem.errs, durationMs, reportItem.unstable, reportItem.screenshotPath);

        // NOTE: here we assume that tests are sorted by fixture.
        // Therefore, if the next report item has a different
        // fixture, we can report this fixture start.
        var nextReportItem = this.reportQueue[0];

        if (nextReportItem && nextReportItem.fixturePath !== reportItem.fixturePath)
            this.plugin.reportFixtureStart(nextReportItem.fixtureName, nextReportItem.fixturePath);
    }

    _assignTaskEventHandlers (task) {
        task.once('start', () => {
            var startTime  = new Date();
            var userAgents = task.browserConnections.map(bc => bc.userAgent);
            var first      = this.reportQueue[0];

            this.plugin.reportTaskStart(startTime, userAgents, this.testCount);
            this.plugin.reportFixtureStart(first.fixtureName, first.fixturePath);
        });

        task.on('test-run-start', testRun => {
            var reportItem = this._getReportItemForTestRun(testRun);

            if (!reportItem.startTime)
                reportItem.startTime = new Date();
        });

        task.on('test-run-done', testRun => {
            var reportItem = this._getReportItemForTestRun(testRun);
            var userAgent  = testRun.browserConnection.userAgent;

            testRun.errs.forEach(err => err.userAgent = userAgent);

            reportItem.pendingRuns--;
            reportItem.errs     = reportItem.errs.concat(testRun.errs);
            reportItem.unstable = reportItem.unstable || testRun.unstable;

            if (!reportItem.pendingRuns) {
                if (task.screenshots.hasCapturedFor(testRun.test))
                    reportItem.screenshotPath = task.screenshots.getPathFor(testRun.test);

                this._shiftReportQueue();
            }
        });

        task.once('done', () => {
            var endTime = new Date();

            this.plugin.reportTaskDone(endTime, this.passed);
        });
    }
}
