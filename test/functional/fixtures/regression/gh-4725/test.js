const { expect }         = require('chai');
const { createReporter } = require('../../../utils/reporter');

const log = [];

const reporter = createReporter({
    reportTestStart (name) {
        log.push(`start: ${name}`);
    },
    reportTestDone (name) {
        log.push(`done: ${name}`);
    }
});

const expectedLog = [
    `start: test 0`,
    `done: test 0`,
    `start: test 1`,
    `done: test 1`
];

describe('[Regression](GH-4725)', function () {
    it('Should respect test start/done event order', function () {
        return runTests('testcafe-fixtures/index.js', null, { reporter })
            .then(() => {
                expect(log).eql(expectedLog);
            });
    });
});
