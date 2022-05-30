const path                       = require('path');
const createTestCafe             = require('../../../../../../lib');
const config                     = require('../../../../config');
const { createSimpleTestStream } = require('../../../../utils/stream');
const { expect }                 = require('chai');
const flowInfoStorage            = require('./utils/flow-info-storage');

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
    describe('Global hooks', function () {
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

        describe('[API] testRun global before/after hooks', () => {

            before(async () => {
                cafe = await createTestCafe({
                    configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/test-run-config.js'),
                });
            });

            afterEach(function () {
                cafe.close();
            });

            it('Should run hooks for all tests', async () => {
                await runTestsLocal('');
            });

            it('Should fail all tests in fixture if testRun.before hooks fails', async () => {
                return runTests('./testcafe-fixtures/test-run-test.js', null, {
                    shouldFail: true,
                    only:       'chrome',
                    hooks:      {
                        testRun: {
                            before: async () => {
                                throw new Error('$$before$$');
                            },
                        },
                    },
                }).catch(errs => {

                    expect(errs.length).eql(3);

                    errs.forEach(err => {
                        expect(err).contains('Error in testRun.before hook');
                        expect(err).contains('$$before$$');
                    });
                });
            });
        });

        describe('[API] Request Hooks', () => {
            describe('RequestMock', () => {
                before(async () => {
                    cafe = await createTestCafe({
                        configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/request-mock-config.js'),
                    });
                });

                after(function () {
                    cafe.close();
                });

                it('Should mock requests', () => {
                    return runTestsLocal('test');
                });
            });

            describe('RequestLogger', () => {
                before(async () => {
                    cafe = await createTestCafe({
                        configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/request-logger-config.js'),
                    });
                });

                after(function () {
                    cafe.close();
                });

                it('Should log requests', () => {
                    return runTestsLocal('test');
                });
            });
        });

        describe('Hooks execution flow', () => {
            before(async () => {
                cafe = await createTestCafe({
                    configFile: path.resolve('./test/functional/fixtures/api/es-next/global-hooks/data/execution-flow-config.js'),
                });
            });

            after(() => {
                return cafe.close();
            });

            afterEach(() => {
                flowInfoStorage.delete();
            });

            it('Test with local hooks', async () => {
                await runTestsLocal('Test with local hooks');

                expect(flowInfoStorage.getData()).eql([
                    'globalTestRunBefore',
                    'globalFixtureBefore',
                    'localFixtureBefore',
                    'globalTestBefore',
                    'localTestBefore',
                    'test body',
                    'localTestAfter',
                    'globalTestAfter',
                    'localFixtureAfter',
                    'globalFixtureAfter',
                    'globalTestRunAfter',
                ]);
            });

            it('Test with each hooks', async () => {
                await runTestsLocal('Test with each hooks');

                expect(flowInfoStorage.getData()).eql([
                    'globalTestRunBefore',
                    'globalFixtureBefore',
                    'localFixtureBefore',
                    'globalTestBefore',
                    'eachTestBefore',
                    'test body',
                    'eachTestAfter',
                    'globalTestAfter',
                    'localFixtureAfter',
                    'globalFixtureAfter',
                    'globalTestRunAfter',
                ]);
            });

            it('Test with all hooks', async () => {
                await runTestsLocal('Test with all hooks');

                expect(flowInfoStorage.getData()).eql([
                    'globalTestRunBefore',
                    'globalFixtureBefore',
                    'localFixtureBefore',
                    'globalTestBefore',
                    'localTestBefore',
                    'test body',
                    'localTestAfter',
                    'globalTestAfter',
                    'localFixtureAfter',
                    'globalFixtureAfter',
                    'globalTestRunAfter',
                ]);
            });
        });
    });
}

