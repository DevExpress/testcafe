import BaseReporter from './base';

export default class JSONReporter extends BaseReporter {
    constructor (task, outStream, errorDecorator) {
        super(task, outStream, errorDecorator);

        this.currentFixture = null;

        this.report = {
            startTime:  null,
            endTime:    null,
            userAgents: null,
            passed:     0,
            total:      0,
            fixtures:   []
        };
    }

    _reportTaskStart (startTime, userAgents) {
        this.report.startTime  = startTime;
        this.report.userAgents = userAgents.map(ua => ua.toString());
    }

    _reportFixtureStart (name, path) {
        this.currentFixture = { name, path, tests: [] };
        this.report.fixtures.push(this.currentFixture);
    }

    _reportTestDone (name, errs, durationMs, unstable) {
        errs = errs.map(err => this._formatError(err));

        this.currentFixture.tests.push({ name, errs, durationMs, unstable });
    }

    _reportTaskDone (passed, total, endTime) {
        this.report.passed  = passed;
        this.report.total   = total;
        this.report.endTime = endTime;

        this._end(JSON.stringify(this.report, null, 2));
    }
}
