const path                       = require('path');
const createTestCafe             = require('../../../../../../lib');
const config                     = require('../../../../config');
const { createSimpleTestStream } = require('../../../../utils/stream');
const { expect }                 = require('chai');

let cafe = null;

const runTestsLocal = (testName) => {
    if (!cafe)
        throw new Error('"cafe" isn\'t defined');

    const stream = createSimpleTestStream();
    const runner = cafe.createRunner();

    runner.reporter('json', stream);

    return runner
        .filter(test => {
            return testName ? test === testName : true;
        })
        .run()
        .then(failedCount => {
            const taskReport = JSON.parse(stream.data);
            const testReport = taskReport.fixtures.length === 1 ?
                taskReport.fixtures[0].tests[0] :
                taskReport;

            testReport.warnings    = taskReport.warnings;
            testReport.failedCount = failedCount;

            global.testReport = testReport;
        });
};

const isLocalChrome = config.useLocalBrowsers && config.browsers.some(browser => browser.alias.includes('chrome'));

if (isLocalChrome) {
    describe('[API] fixture global before/after hooks', () => {
        before(async () => {
            cafe = await createTestCafe({
                configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/fixture-config.js'),
            });
        });

        after(function () {
            cafe.close();
        });

        beforeEach(() => {
            global.fixtureBefore = 0;
            global.fixtureAfter  = 0;
        });

        afterEach(() => {
            delete global.fixtureBefore;
            delete global.fixtureAfter;
        });

        it('Should run hooks for all fixture', async () => {
            return runTestsLocal('Test1');
        });

        it('Should run all hooks for fixture', async () => {
            return runTestsLocal('Test2');
        });

        it('Should run hooks in the right order', async () => {
            return runTestsLocal('Test3');
        });
    });

    describe('[API] test global before/after hooks', () => {
        before(async () => {
            cafe = await createTestCafe({
                configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/test-config.js'),
            });
        });

        after(function () {
            cafe.close();
        });

        it('Should run global hooks for all tests', () => {
            return runTestsLocal('Test1');
        });

        it('Should run all hooks in the right order', () => {
            return runTestsLocal('Test2');
        });
    });
}

describe('[API] testRun global before/after hooks', () => {

    afterEach(function () {
        testCafe.close();
    });

    it('Should run hooks for all tests', async () => {
        testCafe = await createTestCafe({ configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/test-run-config.js') });
        await runTests('');
    });

    it('Should fail all tests in fixture if testRun.before hooks fails', async () => {
        return global.runTests('./testcafe-fixtures/test-run-test.js', null, {
            shouldFail: true,
            only:       'chrome, firefox',
            hooks:      {
                testRun: {
                    before: async () => {
                        throw new Error('$$before$$');
                    },
                },
            },
        }).catch(errs => {
            const allErrors = config.currentEnvironment.browsers.length ===
            1 ? errs : errs['chrome'].concat(errs['firefox']);

            expect(allErrors.length).eql(config.currentEnvironment.browsers.length * 3);

            allErrors.forEach(err => {
                expect(err).contains('Error in testRun.before hook');
                expect(err).contains('$$before$$');
            });
        });
    });
});
