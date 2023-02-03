const { expect }                = require('chai');
const fs                        = require('fs');
const generateReporter          = require('./reporter');
const { createReporter }        = require('../../utils/reporter');
const { createWarningReporter } = require('../../utils/warning-reporter');
const ReporterPluginMethod      = require('../../../../lib/reporter/plugin-methods');
const assertionHelper           = require('../../assertion-helper.js');
const path                      = require('path');
const config                    = require('../../config');
const { skipInProxyless }       = require('../../utils/skip-in');

const {
    createSimpleTestStream,
    createAsyncTestStream,
    createSyncTestStream,
}                        = require('../../utils/stream');
const runTestsWithConfig = require('../../utils/run-tests-with-config');
const del                = require('del');

const experimentalDebug = !!process.env.EXPERIMENTAL_DEBUG;

(config.hasBrowser('chrome') ? describe : describe.skip)('Reporter', () => {
    const stdoutWrite = process.stdout.write;
    const stderrWrite = process.stderr.write;

    afterEach(() => {
        process.stdout.write = stdoutWrite;
        process.stderr.write = stdoutWrite;
    });

    it('Should support several different reporters for a test run', function () {
        const stream1 = createSimpleTestStream();
        const stream2 = createSimpleTestStream();

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', {
            only:     ['chrome'],
            reporter: [
                {
                    name:   'json',
                    output: stream1,
                },
                {
                    name:   'list',
                    output: stream2,
                },
            ],
        })
            .then(() => {
                expect(stream1.data).to.contains('Chrome');
                expect(stream1.data).to.contains('Reporter');
                expect(stream1.data).to.contains('Simple test');
                expect(stream2.data).to.contains('Chrome');
                expect(stream2.data).to.contains('Reporter');
                expect(stream2.data).to.contains('Simple test');
            });
    });

    it('Should wait until reporter stream is finished (GH-2502)', function () {
        const stream = createAsyncTestStream();

        const runOpts = {
            only:     ['chrome'],
            reporter: [
                {
                    name:   'json',
                    output: stream,
                },
            ],
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                expect(stream.finalCalled).to.be.ok;
            });
    });

    it('Should wait until reporter stream failed to finish (GH-2502)', function () {
        const stream = createAsyncTestStream({ shouldFail: true });

        const runOpts = {
            only:     ['chrome'],
            reporter: [
                {
                    name:   'json',
                    output: stream,
                },
            ],
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                expect(stream.finalCalled).to.be.ok;
            });
    });

    it('Should not close stdout when it is specified as a reporter stream (GH-3114)', function () {
        let streamFinished = false;

        process.stdout.write = () => {
            process.stdout.write = stdoutWrite;
        };

        process.stdout.on('finish', () => {
            streamFinished = false;
        });

        const runOpts = {
            only:     ['chrome'],
            reporter: [
                {
                    name:   'json',
                    output: process.stdout,
                },
            ],
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                process.stdout.write = stdoutWrite;

                expect(streamFinished).to.be.not.ok;
            });
    });

    it('Should not close stderr when it is specified as a reporter stream (GH-3114)', function () {
        let streamFinished = false;

        process.stderr.write = () => {
            process.stderr.write = stderrWrite;
        };

        process.stderr.on('finish', () => {
            streamFinished = false;
        });

        const runOpts = {
            only:     ['chrome'],
            reporter: [
                {
                    name:   'json',
                    output: process.stderr,
                },
            ],
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                process.stderr.write = stderrWrite;

                expect(streamFinished).to.be.not.ok;
            });
    });

    it('Should not close stdout when undefined is specified as a reporter stream (GH-3114)', function () {
        let streamFinished = false;

        process.stdout.write = () => {
            process.stdout.write = stdoutWrite;
        };

        process.stdout.on('finish', () => {
            streamFinished = false;
        });

        const runOpts = {
            only:     ['chrome'],
            reporter: [
                {
                    name:   'json',
                    output: void 0,
                },
            ],
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                expect(streamFinished).to.be.not.ok;
            });
    });

    it('Should not close tty streams (GH-3114)', function () {
        const stream = createAsyncTestStream({ shouldFail: true });

        stream.isTTY = true;

        const runOpts = {
            only:     ['chrome'],
            reporter: [
                {
                    name:   'json',
                    output: stream,
                },
            ],
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                expect(stream.finalCalled).to.be.not.ok;
            });
    });

    it('Should support filename as reporter output', () => {
        const testStream     = createSimpleTestStream();
        const reportFileName = 'list.report';

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', {
            only:     ['chrome'],
            reporter: [
                {
                    name:   'list',
                    output: testStream,
                },
                {
                    name:   'list',
                    output: reportFileName,
                },
            ],
        })
            .then(() => {
                const reportDataFromFile = fs.readFileSync(reportFileName).toString();

                expect(testStream.data).eql(reportDataFromFile);

                fs.unlinkSync(reportFileName);
            });
    });

    it('Should work with streams that emit the "finish" event synchronously (GH-3209)', function () {
        const stream = createSyncTestStream();

        const runOpts = {
            only: ['chrome'],

            reporter: [
                {
                    name:   'json',
                    output: stream,
                },
            ],
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                expect(stream.finalCalled).to.be.ok;
            });
    });

    it('reportTestActionDone should work in the raw tests', () => {
        const expected = [
            { expression: 'Selector(\'#button\')', element: { tagName: 'button', attributes: { type: 'button', id: 'button' } } },
        ];

        function customReporter (log) {
            return createReporter({
                reportTestActionDone: async (name, { command, browser }) => {
                    log[browser.alias] = log[browser.alias] || [];

                    if (command.selector)
                        log[browser.alias].push(command.selector);
                },
            });
        }

        const log = {};

        return runTests('testcafe-fixtures/index-test.testcafe', 'reportTestActionDone should work in the raw tests', { reporter: customReporter(log) })
            .then(() => {
                const logs = Object.values(log);

                expect(logs.length).gt(0);

                logs.forEach(browserLog => expect(browserLog).eql(expected));
            });
    });

    describe('Test actions', () => {
        function generateRunOptions (log, options) {
            return {
                only:               ['chrome'],
                disableScreenshots: true,
                reporter:           generateReporter(log, options),
            };
        }

        let log = null;

        beforeEach(() => {
            log = [];
        });

        it('Simple command', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Simple command test', generateRunOptions(log, {
                includeBrowserInfo: true,
                includeTestInfo:    true,
            }))
                .then(() => {
                    expect(log).eql([
                        {
                            name:    'click',
                            action:  'start',
                            browser: 'chrome',
                            test:    {
                                id:    'test-id',
                                name:  'Simple command test',
                                phase: 'inTest',
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter',
                            },
                        },
                        {
                            name:    'click',
                            action:  'done',
                            command: {
                                type:     'click',
                                selector: 'Selector(\'#target\')',
                                options:  {
                                    offsetX: 10,
                                },
                            },
                            test: {
                                id:    'test-id',
                                name:  'Simple command test',
                                phase: 'inTest',
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter',
                            },
                        },
                    ]);
                });
        });

        it('Simple command Error', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Simple command err test', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        {
                            name:   'click',
                            action: 'start',
                        },
                        {
                            name:    'click',
                            action:  'done',
                            command: {
                                type:     'click',
                                selector: 'Selector(\'#non-existing-target\')',
                            },
                            err: 'E24',
                        },
                    ]);
                });
        });

        it('Simple assertion', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Simple assertion', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        {
                            name:   'eql',
                            action: 'start',
                        },
                        {
                            name:    'eql',
                            action:  'done',
                            command: {
                                type:          'assertion',
                                actual:        true,
                                assertionType: 'eql',
                                expected:      true,
                                expected2:     void 0,
                                message:       'assertion message',
                                options:       {
                                    timeout: 100,
                                },
                            },
                        },
                    ]);
                });
        });

        it('Selector assertion', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Selector assertion', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        {
                            name:   'eql',
                            action: 'start',
                        },
                        {
                            name:    'eql',
                            action:  'done',
                            command: {
                                type:          'assertion',
                                actual:        'target',
                                assertionType: 'eql',
                                expected:      'target',
                                expected2:     void 0,
                                message:       null,
                            },
                        },
                    ]);
                });
        });

        it('Snapshot', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Snapshot', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        {
                            name:   'execute-selector',
                            action: 'start',
                        },
                        {
                            name:    'execute-selector',
                            action:  'done',
                            command: {
                                selector: 'Selector(\'#target\')',
                                type:     'execute-selector',
                            },
                        },
                        {
                            name:   'execute-selector',
                            action: 'start',
                        },
                        {
                            name:    'execute-selector',
                            action:  'done',
                            command: {
                                selector: 'Selector(\'body\').find(\'#target\')',
                                type:     'execute-selector',
                            },
                        },
                    ]);
                });
        });

        it('Client Function', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Client Function', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        { name: 'execute-client-function', action: 'start' },
                        {
                            name:    'execute-client-function',
                            action:  'done',
                            command: {
                                clientFn: {
                                    args: [
                                        1,
                                        true,
                                    ],
                                    code: '(function(){ var func = function func(bool) {return function () {return bool;};}; return func;})();',
                                },
                                type: 'execute-client-function',
                            },
                        }]
                    );
                });
        });

        it('Complex command', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Complex command test', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        { name: 'useRole', action: 'start' },
                        {
                            name:    'useRole',
                            action:  'done',
                            command: {
                                role: {
                                    loginUrl: 'http://localhost:3000/fixtures/reporter/pages/index.html',
                                    options:  { preserveUrl: true },
                                    phase:    'initialized',
                                },
                                type: 'useRole',
                            },
                        },
                    ]);
                });
        });

        it('Complex nested command', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Complex nested command test', generateRunOptions(log, { includeTestInfo: true }))
                .then(() => {
                    expect(log).eql([
                        {
                            name:   'useRole',
                            action: 'start',
                            test:   {
                                id:    'test-id',
                                name:  'Complex nested command test',
                                phase: 'inTest',
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter',
                            },
                        },
                        {
                            name:   'click',
                            action: 'start',
                            test:   {
                                id:    'test-id',
                                name:  'Complex nested command test',
                                phase: 'inRoleInitializer',
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter',
                            },
                        },
                        {
                            name:    'click',
                            action:  'done',
                            command: {
                                selector: 'Selector(\'#target\')',
                                type:     'click',
                            },
                            test: {
                                id:    'test-id',
                                name:  'Complex nested command test',
                                phase: 'inRoleInitializer',
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter',
                            },
                        },
                        {
                            name:    'useRole',
                            action:  'done',
                            command: {
                                role: {
                                    loginUrl: 'http://localhost:3000/fixtures/reporter/pages/index.html',
                                    options:  { 'preserveUrl': false },
                                    phase:    'initialized',
                                },
                                type: 'useRole',
                            },
                            test: {
                                id:    'test-id',
                                name:  'Complex nested command test',
                                phase: 'inTest',
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter',
                            },
                        },
                    ]);
                });
        });

        it('Complex nested command error', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Complex nested command error', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        { name: 'useRole', action: 'start' },
                        { name: 'click', action: 'start' },
                        {
                            name:    'click',
                            action:  'done',
                            command: {
                                selector: 'Selector(\'#non-existing-element\')',
                                type:     'click',
                            },
                            err: 'E24',
                        },
                        {
                            name:    'useRole',
                            action:  'done',
                            command: {
                                role: {
                                    loginUrl: 'http://localhost:3000/fixtures/reporter/pages/index.html',
                                    options:  { 'preserveUrl': false },
                                    phase:    'initialized',
                                },
                                type: 'useRole',
                            },
                        },
                    ]);
                });
        });

        it('Eval', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Eval', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        { name: 'execute-client-function', action: 'start' },
                        {
                            name:    'execute-client-function',
                            action:  'done',
                            command: {
                                clientFn: {
                                    args: [],
                                    code: '(function(){ var func = function func() {return document.getElementById(\'#target\');}; return func;})();',
                                },
                                type: 'execute-client-function',
                            },
                        },
                    ]);
                });
        });

        it('Should not add action information in report if action was emitted after test done (GH-5650)', () => {
            return runTests('testcafe-fixtures/index-test.js', 'Action done after test done', generateRunOptions(log))
                .then(() => {
                    const EXECUTE_CLIENT_FUNCTION_ACTION_RECORD = { name: 'execute-client-function', action: 'start' };
                    const WAIT_ACTION_RECORD                    = { name: 'wait', action: 'start' };

                    // NOTE: Due to an additional internal command in debug mode,
                    // the events execution order is different.
                    const EXPECTED_LOG = [
                        experimentalDebug ? WAIT_ACTION_RECORD : EXECUTE_CLIENT_FUNCTION_ACTION_RECORD,
                        experimentalDebug ? EXECUTE_CLIENT_FUNCTION_ACTION_RECORD : WAIT_ACTION_RECORD,
                        {
                            name:    'execute-client-function',
                            action:  'done',
                            command: {
                                type:     'execute-client-function',
                                clientFn: {
                                    code: '(function(){ var func = function func() {return  __get$Loc(location) .reload(true);}; return func;})();',
                                    args: [],
                                },
                            },
                        },
                    ];

                    expect(log).eql(EXPECTED_LOG);
                });
        });

        it('Value typed using the "typeText" action in the input[type=password] should be masked', () => {
            return runTests(
                'testcafe-fixtures/index-test.js',
                'The "typeText" action with the input[type=password]',
                { reporter: generateReporter(log, { includeCommandInfo: true }) }
            ).then(() => {
                expect(log).to.include.deep.members([
                    {
                        name:    'typeText',
                        action:  'start',
                        command: {
                            type:     'type-text',
                            selector: {
                                expression: "Selector('#password-input')",
                            },
                            options: {
                                confidential: true,
                            },
                            text: '********',
                        },
                    },
                    {
                        name:    'typeText',
                        action:  'done',
                        command: {
                            type:     'type-text',
                            selector: "Selector('#password-input')",
                            options:  {
                                confidential: true,
                            },
                            text: '********',
                        },
                    },
                ]);
            });
        });

        it('Value typed using the "typeText" action should be masked if "confidential" flag is set to true', () => {
            return runTests(
                'testcafe-fixtures/index-test.js',
                'The "typeText" action with the input[type=text] and the "confidential" flag set to true',
                { reporter: generateReporter(log, { includeCommandInfo: true }) }
            ).then(() => {
                expect(log).to.include.deep.members([
                    {
                        name:    'typeText',
                        action:  'start',
                        command: {
                            type:     'type-text',
                            selector: {
                                expression: "Selector('#input')",
                            },
                            options: {
                                confidential: true,
                            },
                            text: '********',
                        },
                    },
                    {
                        name:    'typeText',
                        action:  'done',
                        command: {
                            type:     'type-text',
                            selector: "Selector('#input')",
                            options:  {
                                confidential: true,
                            },
                            text: '********',
                        },
                    },
                ]);
            });
        });

        it('Value typed using the "typeText" action shouldn\'t be masked if "confidential" flag is set to false', () => {
            return runTests(
                'testcafe-fixtures/index-test.js',
                'The "typeText" action with the input[type=password] and the "confidential" flag set to false',
                { reporter: generateReporter(log, { includeCommandInfo: true }) }
            ).then(() => {
                expect(log).to.include.deep.members([
                    {
                        name:    'typeText',
                        action:  'start',
                        command: {
                            type:     'type-text',
                            selector: {
                                expression: "Selector('#password-input')",
                            },
                            options: {
                                confidential: false,
                            },
                            text: 'pa$$w0rd',
                        },
                    },
                    {
                        name:    'typeText',
                        action:  'done',
                        command: {
                            type:     'type-text',
                            selector: "Selector('#password-input')",
                            options:  {
                                confidential: false,
                            },
                            text: 'pa$$w0rd',
                        },
                    },
                ]);
            });
        });

        it('Value typed using the "pressKey" action in the input[type=password] should be masked', () => {
            return runTests(
                'testcafe-fixtures/index-test.js',
                'The "pressKey" action with the input[type=password]',
                { reporter: generateReporter(log, { includeCommandInfo: true }) }
            ).then(() => {
                expect(log).to.include.deep.members([
                    {
                        name:    'pressKey',
                        action:  'start',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: true,
                            },
                            keys: '********',
                        },
                    },
                    {
                        name:    'pressKey',
                        action:  'done',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: true,
                            },
                            keys: '********',
                        },
                    },
                ]);
            });
        });

        it('Value typed using the "pressKey" action should be masked if "confidential" flag is set to true', () => {
            return runTests(
                'testcafe-fixtures/index-test.js',
                'The "pressKey" action with the input[type=text] and the "confidential" flag set to true',
                { reporter: generateReporter(log, { includeCommandInfo: true }) }
            ).then(() => {
                expect(log).to.include.deep.members([
                    {
                        name:    'pressKey',
                        action:  'start',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: true,
                            },
                            keys: '********',
                        },
                    },
                    {
                        name:    'pressKey',
                        action:  'done',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: true,
                            },
                            keys: '********',
                        },
                    },
                ]);
            });
        });

        it('Value typed using the "pressKey" action shouldn\'t be masked if "confidential" flag is set to false', () => {
            return runTests(
                'testcafe-fixtures/index-test.js',
                'The "pressKey" action with the input[type=password] and the "confidential" flag set to false',
                { reporter: generateReporter(log, { includeCommandInfo: true }) }
            ).then(() => {
                expect(log).to.include.deep.members([
                    {
                        name:    'pressKey',
                        action:  'start',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: false,
                            },
                            keys: 'p a $ $ w 0 r d enter',
                        },
                    },
                    {
                        name:    'pressKey',
                        action:  'done',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: false,
                            },
                            keys: 'p a $ $ w 0 r d enter',
                        },
                    },
                ]);
            });
        });

        it('Should repeat role error in each tests', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Repeated role error', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        { name: 'useRole', action: 'start' },
                        { name: 'click', action: 'start' },
                        {
                            name:    'click',
                            action:  'done',
                            command: {
                                selector: 'Selector(\'#non-existing-element\')',
                                type:     'click',
                            },
                            err: 'E24',
                        },
                        {
                            name:    'useRole',
                            action:  'done',
                            command: {
                                role: {
                                    loginUrl: 'http://localhost:3000/fixtures/reporter/pages/index.html',
                                    options:  { 'preserveUrl': false },
                                    phase:    'initialized',
                                },
                                type: 'useRole',
                            },
                        },
                        { name: 'useRole', action: 'start' },
                        {
                            name:    'useRole',
                            action:  'done',
                            command: {
                                role: {
                                    loginUrl: 'http://localhost:3000/fixtures/reporter/pages/index.html',
                                    options:  { 'preserveUrl': false },
                                    phase:    'initialized',
                                },
                                type: 'useRole',
                            },
                            err: 'E24',
                        },
                    ]);
                });
        });
    });

    describe('Warnings', () => {
        let warningResult          = {};
        let reporter               = null;
        let assertReporterWarnings = null;

        beforeEach(() => {
            ({ reporter, assertReporterWarnings, warningResult } = createWarningReporter());
        });

        if (!config.experimentalDebug) {
            //TODO: Debug mode loses synchronization with unwaiting async function. This bug need to fix.

            it('Should get warning for TestRun', async () => {
                try {
                    await runTests('testcafe-fixtures/index-test.js', 'Asynchronous method', {
                        reporter,
                        shouldFail: true,
                    });

                    throw new Error('Promise rejection expected');
                }
                catch (err) {
                    expect(warningResult.warnings[0].message).to.include("An asynchronous method that you do not await includes an assertion. Inspect that method's execution chain and add the 'await' keyword where necessary.");
                    expect(warningResult.warnings[0].testRunId).to.be.a('string');
                    expect(warningResult.warnings[0].testRunId).to.not.empty;

                    assertReporterWarnings('ok');
                }
            });
        }

        if (config.useLocalBrowsers) {
            it('Should get warning for Task', async () => {
                try {
                    await runTests('./testcafe-fixtures/index-test.js', 'Take screenshots with same path', {
                        setScreenshotPath: true,
                        shouldFail:        true,
                        reporter,
                    });

                    throw new Error('Promise rejection expected');
                }
                catch (err) {
                    const SCREENSHOTS_PATH   = path.resolve(assertionHelper.SCREENSHOTS_PATH);
                    const screenshotFileName = path.join(SCREENSHOTS_PATH, '1.png');

                    expect(warningResult.warnings[0].message).to.include(
                        `The file at "${screenshotFileName}" already exists. It has just been rewritten ` +
                        'with a recent screenshot. This situation can possibly cause issues. To avoid them, make sure ' +
                        'that each screenshot has a unique path. If a test runs in multiple browsers, consider ' +
                        'including the user agent in the screenshot path or generate a unique identifier in another way.',
                    );
                }

                await assertionHelper.removeScreenshotDir();
            });
        }

        skipInProxyless('Should get warning for request hook', async () => {
            await runTests('./testcafe-fixtures/failed-cors-validation.js', 'Failed CORS validation', {
                only: 'chrome',
                reporter,
            });

            expect(warningResult.warnings[0].message).to.include('RequestMock: CORS validation failed for a request specified as { url: "http://dummy-url.com/get" }');
        });

        it('Should get warning for request hook', async () => {
            await runTests('./testcafe-fixtures/index-test.js', 'Simple test', {
                only:         'chrome',
                reporter,
                tsConfigPath: 'path-to-ts-config',
            });

            expect(warningResult.warnings[0].message).to.eql("The 'tsConfigPath' option is deprecated and will be removed in the next major release. Use the 'compilerOptions.typescript.configPath' option instead.");
        });
    });

    describe('Action snapshots', () => {
        it('Basic', () => {
            const expected = [
                { expression: 'Selector(\'#input\')', timeout: 11000, element: { tagName: 'input', attributes: { value: '100', type: 'text', id: 'input' } } },
                { expression: 'Selector(\'#obscuredInput\')', element: { tagName: 'div', attributes: { id: 'fixed' } } },
                { expression: 'Selector(\'#obscuredInput\')', element: { tagName: 'div', attributes: { id: 'fixed' } } },
                { expression: 'Selector(\'#obscuredDiv\')', element: { tagName: 'div', attributes: { id: 'obscuredDiv' } } },
                { expression: 'Selector(\'#p1\')', element: { attributes: { id: 'p1' }, tagName: 'p' } },
                { expression: 'Selector(\'#p2\')', element: { attributes: { id: 'p2' }, tagName: 'p' } },
            ];

            function customReporter (log) {
                return () => {
                    return {
                        async reportTestActionDone (name, { command, browser }) {
                            log[browser.alias] = log[browser.alias] || [];

                            if (command.selector)
                                log[browser.alias].push(command.selector);

                            if (command.startSelector)
                                log[browser.alias].push(command.startSelector);

                            if (command.endSelector)
                                log[browser.alias].push(command.endSelector);

                            if (command.destinationSelector)
                                log[browser.alias].push(command.destinationSelector);
                        },
                        async reportTaskStart () {
                        },
                        async reportFixtureStart () {
                        },
                        async reportTestDone () {
                        },
                        async reportTaskDone () {
                        },
                    };
                };
            }

            const log = {};

            return runTests('testcafe-fixtures/snapshots-test.js', 'Basic', { reporter: customReporter(log) })
                .then(() => {
                    const logs = Object.values(log);

                    expect(logs.length).gt(0);

                    logs.forEach(browserLog => expect(browserLog).eql(expected));
                });
        });

        it('Full snapshot', () => {
            function customReporter (log) {
                return () => {
                    return {
                        async reportTestActionDone (name, { command, browser }) {
                            log[browser.alias] = log[browser.alias] || [];

                            if (command.selector)
                                log[browser.alias].push(command.selector);
                        },
                        async reportTaskStart () {
                        },
                        async reportFixtureStart () {
                        },
                        async reportTestDone () {
                        },
                        async reportTaskDone () {
                        },
                    };
                };
            }

            const log = {};

            return runTests('testcafe-fixtures/snapshots-test.js', 'Full snapshot', { reporter: customReporter(log) })
                .then(() => {
                    const logs = Object.values(log);

                    expect(logs.length).gt(0);

                    logs.forEach(browserLog => {
                        expect(browserLog[0].expression).eql('Selector(\'#input\')');
                        expect(browserLog[0].element.tagName).eql('input');
                        expect(browserLog[0].element.attributes.type).eql('text');
                    });
                });
        });
    });

    describe('Screenshot errors', () => {
        it('Screenshot on action error', () => {
            let testDoneErrors     = null;
            const actionDoneErrors = [];

            function screenshotReporter () {
                return {
                    async reportTestActionDone (name, { err }) {
                        actionDoneErrors.push(err);
                    },
                    async reportTaskStart () {
                    },
                    async reportFixtureStart () {
                    },
                    async reportTestDone (name, testRunInfo) {
                        testDoneErrors = testRunInfo.errs;
                    },
                    async reportTaskDone () {
                    },
                };
            }

            return runTests('testcafe-fixtures/index-test.js', 'Screenshot on action error', {
                only:               'chrome',
                reporter:           screenshotReporter,
                screenshotsOnFails: true,
            })
                .then(() => {
                    expect(actionDoneErrors[0]).is.undefined;
                    expect(actionDoneErrors[1].code).eql('E24');
                    expect(testDoneErrors.map(err => err.code)).eql(['E24', 'E8']);
                    expect(testDoneErrors[0].screenshotPath).is.not.empty;
                    expect(testDoneErrors[0].screenshotPath).eql(testDoneErrors[1].screenshotPath);

                    return assertionHelper.removeScreenshotDir('screenshots');
                });
        });

        it('Should put actionId on screenshot information', async () => {
            function customReporter (actionIds, screenshots) {
                return createReporter({
                    reportTestActionDone: async (name, { command }) => {
                        actionIds.push(command.actionId);
                    },

                    reportTestDone: async (name, testRunInfo) => {
                        testRunInfo.screenshots.forEach((screenshot) => {
                            screenshots[screenshot.actionId] = screenshot.screenshotPath;
                        });
                    },
                });
            }

            const actionIds = [];
            const screenshots = {};

            await runTests('./testcafe-fixtures/index-test.js', 'Take a screenshot on action and on error', {
                only:               'chrome',
                reporter:           customReporter(actionIds, screenshots),
                screenshotsOnFails: true,
            });

            expect(actionIds.length).eql(2);
            actionIds.forEach(actionId => {
                expect(screenshots[actionId]).is.not.empty;
            });

            assertionHelper.removeScreenshotDir('screenshots');
        });

    });

    it('Should call the "init" method of reporters if it\'s defined', function () {
        const reportInitSuccess = result => createReporter({
            init () {
                result.init = result.init || [];

                result.init.push(true);
            },
            reportTaskDone () {
                result.done = result.done || [];

                result.done.push(true);
            },
        });

        const reportNoInit = result => createReporter({
            reportTaskDone () {
                result.done = result.done || [];

                result.done.push(true);
            },
        });

        const result = {};

        return runTests('testcafe-fixtures/reporter-init-method.js', null, {
            reporter: [reportInitSuccess(result), reportNoInit(result)],
        })
            .then(() => {
                expect(result.init).eql([true]);
                expect(result.done).eql([true, true]);
            });
    });

    skipInProxyless('Should raise an error when uncaught exception occurred in any reporter method', async () => {
        function createReporterWithBrokenMethod (method) {
            const base = {
                async reportTaskStart () {},
                async reportFixtureStart () {},
                async reportTestDone () {},
                async reportTaskDone () {},
            };

            base[method] = () => {
                throw new Error('oops');
            };

            return () => base;
        }

        for (const method of Object.values(ReporterPluginMethod)) {
            try {
                await runTests(
                    'testcafe-fixtures/index-test.js',
                    'Simple test',
                    {
                        reporter:     createReporterWithBrokenMethod(method),
                        shouldFail:   true,
                        tsConfigPath: 'path-to-ts-config',
                    }
                );

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).startsWith(`The "${method}" method of the "function () {}" reporter produced an uncaught error. Error details:\nError: oops`);
            }
        }
    });

    it('Should work with option from configuration file', function () {

        return runTestsWithConfig('Simple test', './test/functional/fixtures/reporter/configs/xunit-config.js')
            .then(() => {
                const pathReport = path.resolve(__dirname, 'report.xml');
                const report = fs.readFileSync(pathReport).toString();

                expect(report).contains('<?xml version="1.0" encoding="UTF-8" ?>');

                del(pathReport);
            });
    });

    skipInProxyless('Should set options _hasTaskErrors to the runner if an error occurs', async () => {
        try {
            await runTests('testcafe-fixtures/index-test.js', 'Simple command err test', { only: ['chrome'], shouldFail: true });
        }
        catch (err) {
            expect(testCafe.runner._hasTaskErrors).eql(true);
        }
    });
});
