const expect               = require('chai').expect;
const fs                   = require('fs');
const generateReporter     = require('./reporter');
const ReporterPluginMethod = require('../../../../lib/reporter/plugin-methods');

const {
    createSimpleTestStream,
    createAsyncTestStream,
    createSyncTestStream
} = require('../../utils/stream');

describe('Reporter', () => {
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
                    output: stream1
                },
                {
                    name:   'list',
                    output: stream2
                }
            ]
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
                    output: stream
                }
            ]
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
                    output: stream
                }
            ]
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
                    output: process.stdout
                }
            ]
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
                    output: process.stderr
                }
            ]
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
                    output: void 0
                }
            ]
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
                    output: stream
                }
            ]
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
                    output: testStream
                },
                {
                    name:   'list',
                    output: reportFileName
                }
            ]
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
                    output: stream
                }
            ]
        };

        return runTests('testcafe-fixtures/index-test.js', 'Simple test', runOpts)
            .then(() => {
                expect(stream.finalCalled).to.be.ok;
            });
    });

    describe('Test actions', () => {
        function generateRunOptions (log, options) {
            return {
                only:               ['chrome'],
                disableScreenshots: true,
                reporter:           generateReporter(log, options)
            };
        }

        let log = null;

        beforeEach(() => {
            log = [];
        });

        it('Simple command', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Simple command test', generateRunOptions(log, {
                includeBrowserInfo: true,
                includeTestInfo:    true
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
                                phase: 'inTest'
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter'
                            }
                        },
                        {
                            name:    'click',
                            action:  'done',
                            command: {
                                type:     'click',
                                selector: 'Selector(\'#target\')',
                                options:  {
                                    offsetX: 10
                                }
                            },
                            test: {
                                id:    'test-id',
                                name:  'Simple command test',
                                phase: 'inTest'
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter'
                            }
                        }
                    ]);
                });
        });

        it('Simple command Error', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Simple command err test', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        {
                            name:   'click',
                            action: 'start'
                        },
                        {
                            name:    'click',
                            action:  'done',
                            command: {
                                type:     'click',
                                selector: 'Selector(\'#non-existing-target\')'
                            },
                            err: 'E24'
                        }
                    ]);
                });
        });

        it('Simple assertion', function () {
            return runTests('testcafe-fixtures/index-test.js', 'Simple assertion', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        {
                            name:   'eql',
                            action: 'start'
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
                                    timeout: 100
                                }
                            }
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
                            action: 'start'
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
                                message:       null
                            }
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
                            action: 'start'
                        },
                        {
                            name:    'execute-selector',
                            action:  'done',
                            command: {
                                selector: 'Selector(\'#target\')',
                                type:     'execute-selector'
                            }
                        },
                        {
                            name:   'execute-selector',
                            action: 'start'
                        },
                        {
                            name:    'execute-selector',
                            action:  'done',
                            command: {
                                selector: 'Selector(\'body\').find(\'#target\')',
                                type:     'execute-selector'
                            }
                        }
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
                                        true
                                    ],
                                    code: '(function(){ var func = function func(bool) {return function () {return bool;};}; return func;})();'
                                },
                                type: 'execute-client-function'
                            }
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
                                    phase:    'initialized'
                                },
                                type: 'useRole'
                            }
                        }
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
                                phase: 'inTest'
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter'
                            }
                        },
                        {
                            name:   'click',
                            action: 'start',
                            test:   {
                                id:    'test-id',
                                name:  'Complex nested command test',
                                phase: 'inRoleInitializer'
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter'
                            }
                        },
                        {
                            name:    'click',
                            action:  'done',
                            command: {
                                selector: 'Selector(\'#target\')',
                                type:     'click'
                            },
                            test: {
                                id:    'test-id',
                                name:  'Complex nested command test',
                                phase: 'inRoleInitializer'
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter'
                            }
                        },
                        {
                            name:    'useRole',
                            action:  'done',
                            command: {
                                role: {
                                    loginUrl: 'http://localhost:3000/fixtures/reporter/pages/index.html',
                                    options:  { 'preserveUrl': false },
                                    phase:    'initialized'
                                },
                                type: 'useRole'
                            },
                            test: {
                                id:    'test-id',
                                name:  'Complex nested command test',
                                phase: 'inTest'
                            },
                            fixture: {
                                id:   'fixture-id',
                                name: 'Reporter'
                            }
                        }
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
                                type:     'click'
                            },
                            err: 'E24'
                        },
                        {
                            name:    'useRole',
                            action:  'done',
                            command: {
                                role: {
                                    loginUrl: 'http://localhost:3000/fixtures/reporter/pages/index.html',
                                    options:  { 'preserveUrl': false },
                                    phase:    'initialized'
                                },
                                type: 'useRole'
                            }
                        }
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
                                    code: '(function(){ var func = function func() {return document.getElementById(\'#target\');}; return func;})();'
                                },
                                type: 'execute-client-function'
                            }
                        }
                    ]);
                });
        });

        it('Should not add action information in report if action was emitted after test done (GH-5650)', () => {
            return runTests('testcafe-fixtures/index-test.js', 'Action done after test done', generateRunOptions(log))
                .then(() => {
                    expect(log).eql([
                        { name: 'execute-client-function', action: 'start' },
                        { name: 'wait', action: 'start' },
                        {
                            name:    'execute-client-function',
                            action:  'done',
                            command: {
                                type:     'execute-client-function',
                                clientFn: {
                                    code: '(function(){ var func = function func() {return  __get$Loc(location) .reload(true);}; return func;})();',
                                    args: []
                                }
                            }
                        }
                    ]);
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
                                expression: "Selector('#password-input')"
                            },
                            options: {
                                confidential: true
                            },
                            text: '********'
                        }
                    },
                    {
                        name:    'typeText',
                        action:  'done',
                        command: {
                            type:     'type-text',
                            selector: "Selector('#password-input')",
                            options:  {
                                confidential: true
                            },
                            text: '********'
                        }
                    }
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
                                expression: "Selector('#input')"
                            },
                            options: {
                                confidential: true
                            },
                            text: '********'
                        }
                    },
                    {
                        name:    'typeText',
                        action:  'done',
                        command: {
                            type:     'type-text',
                            selector: "Selector('#input')",
                            options:  {
                                confidential: true
                            },
                            text: '********'
                        }
                    }
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
                                expression: "Selector('#password-input')"
                            },
                            options: {
                                confidential: false
                            },
                            text: 'pa$$w0rd'
                        }
                    },
                    {
                        name:    'typeText',
                        action:  'done',
                        command: {
                            type:     'type-text',
                            selector: "Selector('#password-input')",
                            options:  {
                                confidential: false
                            },
                            text: 'pa$$w0rd'
                        }
                    }
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
                                confidential: true
                            },
                            keys: '********'
                        }
                    },
                    {
                        name:    'pressKey',
                        action:  'done',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: true
                            },
                            keys: '********'
                        }
                    }
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
                            keys: '********'
                        }
                    },
                    {
                        name:    'pressKey',
                        action:  'done',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: true,
                            },
                            keys: '********'
                        }
                    }
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
                                confidential: false
                            },
                            keys: 'p a $ $ w 0 r d enter'
                        }
                    },
                    {
                        name:    'pressKey',
                        action:  'done',
                        command: {
                            type:    'press-key',
                            options: {
                                confidential: false
                            },
                            keys: 'p a $ $ w 0 r d enter'
                        }
                    }
                ]);
            });
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
                { expression: 'Selector(\'#p2\')', element: { attributes: { id: 'p2' }, tagName: 'p' } }
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
                        }
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
                        }
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
                    }
                };
            }

            return runTests('testcafe-fixtures/index-test.js', 'Screenshot on action error', {
                only:               'chrome',
                reporter:           screenshotReporter,
                screenshotsOnFails: true
            })
                .then(() => {
                    expect(actionDoneErrors[0]).is.undefined;
                    expect(actionDoneErrors[1].code).eql('E24');
                    expect(testDoneErrors.map(err => err.code)).eql(['E24', 'E8']);
                    expect(testDoneErrors[0].screenshotPath).is.not.empty;
                    expect(testDoneErrors[0].screenshotPath).eql(testDoneErrors[1].screenshotPath);
                });
        });
    });

    it('Should raise an error when uncaught exception occurred in any reporter method', async () => {
        function createReporterWithBrokenMethod (method) {
            const base = {
                async reportTaskStart () {},
                async reportFixtureStart () {},
                async reportTestDone () {},
                async reportTaskDone () {}
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
                        reporter:   createReporterWithBrokenMethod(method),
                        shouldFail: true
                    }
                );

                throw new Error('Promise rejection expected');
            }
            catch (err) {
                expect(err.message).startsWith(`The "${method}" method of the "function () {}" reporter produced an uncaught error. Error details:\nError: oops`);
            }
        }
    });
});
