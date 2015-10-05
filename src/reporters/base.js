import tty from 'tty';
import chalk from 'chalk';
import wordwrap from '../utils/word-wrap';
import indentString from 'indent-string';
import OS from '../utils/os';
import { find } from '../utils/array';
import format from './errors/format';
import plainTextDecorator from './errors/decorators/plain-text';
import ttyDecorator from './errors/decorators/tty';

export default class BaseReporter {
    constructor (task, outStream = process.stdout, errorDecorator = null) {
        this.DEFAULT_VIEWPORT_WIDTH = 78;

        this.outStream = outStream;

        var isTTY = !!this.outStream.isTTY;

        this.errorDecorator = errorDecorator || (isTTY ? ttyDecorator : plainTextDecorator);

        this.style         = new chalk.constructor({ enabled: isTTY });
        this.viewportWidth = this._getViewportWidth(isTTY);
        this.useWordWrap   = false;
        this.indent        = 0;

        this.passed      = 0;
        this.total       = task.tests.length;
        this.reportQueue = BaseReporter._createReportQueue(task);

        this.symbols = OS.win ?
                       { ok: '√', err: '×' } :
                       { ok: '✓', err: '✖' };

        this._assignTaskEventHandlers(task);
    }

    // Static
    static _createReportQueue (task) {
        var runsPerTest = task.browserConnections.length;

        return task.tests.map(test => BaseReporter._createReportItem(test, runsPerTest));
    }

    static _createReportItem (test, runsPerTest) {
        return {
            fixtureName: test.fixture.name,
            fixturePath: test.fixture.path,
            testName:    test.name,
            pendingRuns: runsPerTest,
            errs:        [],
            unstable:    false,
            startTime:   null
        };
    }

    static _streamCanBeClosed (stream) {
        return stream !== process.stdout && stream !== process.stderr;
    }

    static _errorSorter (errs) {
        errs.sort((err1, err2) => {
            err1 = err1.userAgent + err1.code;
            err2 = err2.userAgent + err2.code;

            if (err1 > err2) return 1;
            if (err1 < err2) return -1;
            return 0;
        });
    }

    _getViewportWidth (isTTY) {
        if (isTTY && tty.isatty(1) && tty.isatty(2)) {
            return process.stdout.getWindowSize ?
                   process.stdout.getWindowSize(1)[0] :
                   tty.getWindowSize()[1];
        }

        return this.DEFAULT_VIEWPORT_WIDTH;
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

        BaseReporter._errorSorter(reportItem.errs);

        this._reportTestDone(reportItem.testName, reportItem.errs, durationMs, reportItem.unstable);

        // NOTE: here we assume that tests are sorted by fixture.
        // Therefore, if the next report item has a different
        // fixture, we can report this fixture start.
        var nextReportItem = this.reportQueue[0];

        if (nextReportItem && nextReportItem.fixturePath !== reportItem.fixturePath)
            this._reportFixtureStart(nextReportItem.fixtureName, nextReportItem.fixturePath);
    }

    _assignTaskEventHandlers (task) {
        task.once('start', () => {
            var startTime  = new Date();
            var userAgents = task.browserConnections.map(bc => bc.userAgent);
            var first      = this.reportQueue[0];

            this._reportTaskStart(startTime, userAgents);
            this._reportFixtureStart(first.fixtureName, first.fixturePath);
        });

        task.on('test-run-start', testRun => {
            var reportItem = this._getReportItemForTestRun(testRun);

            if (!reportItem.startTime)
                reportItem.startTime = new Date();
        });

        task.on('test-run-done', (testRun) => {
            var reportItem = this._getReportItemForTestRun(testRun);
            var userAgent  = testRun.browserConnection.userAgent;

            testRun.errs.forEach(err => err.userAgent = userAgent);

            reportItem.pendingRuns--;
            reportItem.errs     = reportItem.errs.concat(testRun.errs);
            reportItem.unstable = reportItem.unstable || testRun.unstable;

            if (!reportItem.pendingRuns)
                this._shiftReportQueue();
        });

        task.once('done', () => {
            var endTime = new Date();

            this._reportTaskDone(this.passed, this.total, endTime);
        });
    }


    // Stream writing helpers
    _newline () {
        this.outStream.write('\n');

        return this;
    }

    _formatError (err, prefix = '') {
        var maxMsgLength = this.viewportWidth - this.indent - prefix.length;
        var msg          = format(err, this.errorDecorator, maxMsgLength);

        msg = wordwrap(msg, prefix.length, maxMsgLength);

        return prefix + msg.substr(prefix.length);
    }

    _write (text) {
        if (this.useWordWrap)
            text = wordwrap(text, this.indent, this.viewportWidth);
        else
            text = indentString(text, ' ', this.indent);

        this.outStream.write(text);

        return this;
    }

    _end (text) {
        if (text)
            this._write(text);

        if (BaseReporter._streamCanBeClosed(this.outStream))
            this.outStream.end('');
    }


    // Abstract methods
    /* eslint-disable no-unused-vars */

    _reportTaskStart (startTime, userAgents) {
        throw new Error('Not implemented');
    }

    _reportFixtureStart (name, path) {
        throw new Error('Not implemented');
    }

    _reportTestDone (name, errs, durationMs, unstable) {
        throw new Error('Not implemented');
    }

    _reportTaskDone (passed, total, endTime) {
        throw new Error('Not implemented');
    }

    /* eslint-enable no-unused-vars */
}
