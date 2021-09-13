const { createReporter } = require('../../../utils/reporter');
const ExecutedTestInfo   = require('./executed-test-info');

const experimentalDebug = !!process.env.EXPERIMENTAL_DEBUG;

const executedTestInfo = new ExecutedTestInfo();

const reporter = createReporter({
    reportTestDone (name, testRunInfo) {
        executedTestInfo.onTestDone(name, testRunInfo);
    },

    reportTaskDone (endTime, passed, warnings) {
        executedTestInfo.onTaskDone(warnings);
    },
});

if (!experimentalDebug) {
    describe('Should not interrupt test execution after unawaited method with assertion (GH-4613)', () => {
        beforeEach(() => {
            executedTestInfo.clear();
        });

        afterEach(() => {
            executedTestInfo.check();
        });

        it('the test with the unawaited method is first', () => {
            return runTests('./testcafe-fixtures/first.js', null, { reporter });
        });

        it('the test with the unawaited method is middle', () => {
            return runTests('./testcafe-fixtures/middle.js', null, { reporter });
        });

        it('the test with the unawaited method is last', () => {
            return runTests('./testcafe-fixtures/last.js', null, { reporter });
        });
    });
}
