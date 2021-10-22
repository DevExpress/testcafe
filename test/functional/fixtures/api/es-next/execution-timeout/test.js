const { expect } = require('chai');

describe('[API] Timeout execution', function () {
    it('Should terminate the test with the hung process.', () => {
        return runTests('./testcafe-fixtures/execution-timeout-test.js', 'Test', {
            shouldFail:           true,
            only:                 'chrome',
            testExecutionTimeout: 100,
        })
            .catch(errs => {
                expect(errs[0]).to.contains('Test timeout of 100ms exceeded.');
            });
    });

    it('Should terminate the run with the hung process in a test.', () => {
        return runTests('./testcafe-fixtures/execution-timeout-test.js', 'Test', {
            skipJsErrors:        true,
            shouldFail:          true,
            only:                'chrome',
            runExecutionTimeout: 100,
        })
            .catch(errs => {
                expect(errs[0]).to.contains('Run timeout of 100ms exceeded.');
            });
    });

    it('Should terminate the run with the hung process in a test before hook.', () => {
        return runTests('./testcafe-fixtures/execution-timeout-test.js', 'Test with before hook', {
            skipJsErrors:        true,
            shouldFail:          true,
            only:                'chrome',
            runExecutionTimeout: 100,
        })
            .catch(errs => {
                expect(errs[0]).to.contains('Run timeout of 100ms exceeded.');
            });
    });

    it('Should terminate the run with the hung process in a test after hook.', () => {
        return runTests('./testcafe-fixtures/execution-timeout-test.js', 'Test with after hook', {
            skipJsErrors:        true,
            shouldFail:          true,
            only:                'chrome',
            runExecutionTimeout: 100,
        })
            .catch(errs => {
                expect(errs[0]).to.contains('Run timeout of 100ms exceeded.');
            });
    });

    it('Should terminate the run with the hung process in a feature before hook.', () => {
        return runTests('./testcafe-fixtures/execution-timeout-test.js', 'Feature with before hook', {
            skipJsErrors:        true,
            shouldFail:          true,
            only:                'chrome',
            runExecutionTimeout: 100,
        })
            .catch(errs => {
                expect(errs[0]).to.contains('Run timeout of 100ms exceeded.');
            });
    });

    it('Should terminate the run with the hung process in a feature after hook.', () => {
        return runTests('./testcafe-fixtures/execution-timeout-test.js', 'Feature with after hook', {
            skipJsErrors:        true,
            shouldFail:          true,
            only:                'chrome',
            runExecutionTimeout: 100,
        })
            .catch(errs => {
                expect(errs[0]).to.contains('Run timeout of 100ms exceeded.');
            });
    });

    it('Should terminate all tests in the run after the hung process.', () => {
        return runTests('./testcafe-fixtures/execution-timeout-test.js', 'Test', {
            skipJsErrors:        true,
            shouldFail:          true,
            only:                'chrome',
            runExecutionTimeout: 100,
        })
            .catch(errs => {
                expect(errs[0]).to.contains('Run timeout of 100ms exceeded.');
                expect(errs[1]).to.contains('Run timeout of 100ms exceeded.');
            });
    });
});
