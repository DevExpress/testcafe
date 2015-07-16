import BaseReporter from './base';

export default class JSONReporter extends BaseReporter {
    constructor (task, outStream, formatter) {
        super(task, outStream, formatter);

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

    _reportTestDone (name, errMsgs, durationMs, unstable) {
        this.currentFixture.tests.push({ name, errMsgs, durationMs, unstable });
    }

    _reportTaskDone (passed, total, endTime) {
        this.report.passed  = passed;
        this.report.total   = total;
        this.report.endTime = endTime;

        this._end(JSON.stringify(this.report, null, 2));
    }
}
