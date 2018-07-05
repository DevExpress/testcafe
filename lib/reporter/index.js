'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash');

var _pluginHost = require('./plugin-host');

var _pluginHost2 = _interopRequireDefault(_pluginHost);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Reporter = function () {
    function Reporter(plugin, task, outStream) {
        (0, _classCallCheck3.default)(this, Reporter);

        this.plugin = new _pluginHost2.default(plugin, outStream);

        this.passed = 0;
        this.skipped = task.tests.filter(function (test) {
            return test.skip;
        }).length;
        this.testCount = task.tests.length - this.skipped;
        this.reportQueue = Reporter._createReportQueue(task);

        this._assignTaskEventHandlers(task);
    }

    // Static


    Reporter._createReportQueue = function _createReportQueue(task) {
        var runsPerTest = task.browserConnectionGroups.length;

        return task.tests.map(function (test) {
            return Reporter._createReportItem(test, runsPerTest);
        });
    };

    Reporter._createReportItem = function _createReportItem(test, runsPerTest) {
        return {
            fixture: test.fixture,
            test: test,
            screenshotPath: null,
            screenshots: [],
            quarantine: null,
            pendingRuns: runsPerTest,
            errs: [],
            unstable: false,
            startTime: null,
            testRunInfo: null
        };
    };

    Reporter._createTestRunInfo = function _createTestRunInfo(reportItem) {
        return {
            errs: (0, _lodash.sortBy)(reportItem.errs, ['userAgent', 'type']),
            durationMs: new Date() - reportItem.startTime,
            unstable: reportItem.unstable,
            screenshotPath: reportItem.screenshotPath,
            screenshots: reportItem.screenshots,
            quarantine: reportItem.quarantine,
            skipped: reportItem.test.skip
        };
    };

    Reporter.prototype._getReportItemForTestRun = function _getReportItemForTestRun(testRun) {
        return (0, _lodash.find)(this.reportQueue, function (i) {
            return i.test === testRun.test;
        });
    };

    Reporter.prototype._shiftReportQueue = function _shiftReportQueue(reportItem) {
        var currentFixture = null;
        var nextReportItem = null;

        while (this.reportQueue.length && this.reportQueue[0].testRunInfo) {
            reportItem = this.reportQueue.shift();
            currentFixture = reportItem.fixture;

            this.plugin.reportTestDone(reportItem.test.name, reportItem.testRunInfo, reportItem.test.meta);

            // NOTE: here we assume that tests are sorted by fixture.
            // Therefore, if the next report item has a different
            // fixture, we can report this fixture start.
            nextReportItem = this.reportQueue[0];

            if (nextReportItem && nextReportItem.fixture !== currentFixture) this.plugin.reportFixtureStart(nextReportItem.fixture.name, nextReportItem.fixture.path, nextReportItem.fixture.meta);
        }
    };

    Reporter.prototype._assignTaskEventHandlers = function _assignTaskEventHandlers(task) {
        var _this = this;

        task.once('start', function () {
            var startTime = new Date();
            var userAgents = task.browserConnectionGroups.map(function (group) {
                return group[0].userAgent;
            });
            var first = _this.reportQueue[0];

            _this.plugin.reportTaskStart(startTime, userAgents, _this.testCount);
            _this.plugin.reportFixtureStart(first.fixture.name, first.fixture.path, first.fixture.meta);
        });

        task.on('test-run-start', function (testRun) {
            var reportItem = _this._getReportItemForTestRun(testRun);

            if (!reportItem.startTime) reportItem.startTime = new Date();
        });

        task.on('test-run-done', function (testRun) {
            var reportItem = _this._getReportItemForTestRun(testRun);

            reportItem.pendingRuns--;
            reportItem.unstable = reportItem.unstable || testRun.unstable;
            reportItem.errs = reportItem.errs.concat(testRun.errs);

            if (!reportItem.pendingRuns) {
                if (task.screenshots.hasCapturedFor(testRun.test)) {
                    reportItem.screenshotPath = task.screenshots.getPathFor(testRun.test);
                    reportItem.screenshots = task.screenshots.getScreenshotsInfo(testRun.test);
                }

                if (testRun.quarantine) {
                    reportItem.quarantine = testRun.quarantine.attempts.reduce(function (result, errors, index) {
                        var passed = !errors.length;
                        var quarantineAttemptID = index + 1;

                        result[quarantineAttemptID] = { passed: passed };

                        return result;
                    }, {});
                }

                if (!reportItem.testRunInfo) {
                    reportItem.testRunInfo = Reporter._createTestRunInfo(reportItem);

                    if (!reportItem.errs.length && !reportItem.test.skip) _this.passed++;
                }

                _this._shiftReportQueue(reportItem);
            }
        });

        task.once('done', function () {
            var endTime = new Date();

            _this.plugin.reportTaskDone(endTime, _this.passed, task.warningLog.messages);
        });
    };

    return Reporter;
}();

exports.default = Reporter;
module.exports = exports['default'];