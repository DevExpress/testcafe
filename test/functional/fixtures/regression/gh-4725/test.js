const expect = require('chai').expect;

const log = [];

function customReporter () {
    return {
        reportTestStart (name) {
            log.push(`start: ${name}`);
        },
        reportTestDone (name) {
            log.push(`done: ${name}`);
        },
        reportFixtureStart () {
        },
        reportTaskStart () {
        },
        reportTaskDone () {
        }
    };
}

const expectedLog = [
    `start: test 0`,
    `done: test 0`,
    `start: test 1`,
    `done: test 1`
];

describe('[Regression](GH-4725)', function () {
    it('Should respect test start/done event order', function () {
        return runTests('testcafe-fixtures/index.js', null, { reporter: customReporter })
            .then(() => {
                expect(log).eql(expectedLog);
            });
    });
});
