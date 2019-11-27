const expect = require('chai').expect;
const fs     = require('fs');

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

    describe('Methods `test-run-command-start` and `test-run-command-done`', () => {
        function generateReport (log, onlyAPI = false) {
            return function customReporter () {
                return {
                    async reportTaskStart () {},
                    async reportFixtureStart () {},
                    async reportTestDone () {},
                    async reportTaskDone () {},

                    async reportTestRunCommandStart ({ command, isApiMethod }) {
                        if (isApiMethod) {
                            const type = command.assertionType || command.type;

                            log.push(`start action: ${type}`);
                        }
                        else if (!onlyAPI)
                            log.push(`---- start command: ${command.type}`);
                    },

                    async reportTestRunCommandDone ({ command, err, isApiMethod }) {
                        if (err)
                            log.push(`ERROR: ${err.code}`);

                        if (isApiMethod) {
                            const type = command.assertionType || command.type;

                            log.push(`done action: ${type}`);
                        }
                        else if (!onlyAPI)
                            log.push(`---- done command: ${command.type}`);
                    }
                };
            };
        }

        it('Simple command', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log)
            };

            return runTests('testcafe-fixtures/index-test.js', 'Simple command test', runOpts)
                .then(() => {
                    expect(log).eql([
                        'start action: click',
                        '---- start command: click',
                        '---- done command: click',
                        'done action: click',
                        '---- start command: test-done',
                        '---- done command: test-done'
                    ]);
                });
        });

        it('Simple command Error', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log)
            };

            return runTests('testcafe-fixtures/index-test.js', 'Simple command err test', runOpts)
                .then(() => {
                    expect(log).eql([
                        'start action: click',
                        '---- start command: click',
                        'ERROR: E24',
                        '---- done command: click',
                        'done action: click',
                        '---- start command: test-done',
                        '---- done command: test-done'
                    ]);
                });
        });

        it('Selector', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log)
            };

            return runTests('testcafe-fixtures/index-test.js', 'Selector', runOpts)
                .then(() => {
                    expect(log).eql([
                        '---- start command: execute-selector',
                        '---- done command: execute-selector',
                        '---- start command: test-done',
                        '---- done command: test-done'
                    ]);
                });
        });

        it('Simple assertion', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log)
            };

            return runTests('testcafe-fixtures/index-test.js', 'Simple assertion', runOpts)
                .then(() => {
                    expect(log).eql([
                        'start action: eql',
                        'done action: eql',
                        '---- start command: test-done',
                        '---- done command: test-done',
                    ]);
                });
        });

        it('Selector assertion', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log)
            };

            return runTests('testcafe-fixtures/index-test.js', 'Selector assertion', runOpts)
                .then(() => {
                    expect(log).eql([
                        'start action: eql',
                        '---- start command: execute-selector',
                        '---- done command: execute-selector',
                        'done action: eql',
                        '---- start command: test-done',
                        '---- done command: test-done'
                    ]);
                });
        });

        it('Complex command', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log)
            };

            return runTests('testcafe-fixtures/index-test.js', 'Complex command test', runOpts)
                .then(() => {
                    expect(log).eql([
                        'start action: useRole',
                        '---- start command: execute-client-function',
                        '---- done command: execute-client-function',
                        '---- start command: navigate-to',
                        '---- done command: navigate-to',
                        '---- start command: backup-storages',
                        '---- done command: backup-storages',
                        '---- start command: navigate-to',
                        '---- done command: navigate-to',
                        'done action: useRole',
                        '---- start command: test-done',
                        '---- done command: test-done'
                    ]);
                });
        });

        it('Complex nested command', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log)
            };

            return runTests('testcafe-fixtures/index-test.js', 'Complex nested command test', runOpts)
                .then(() => {
                    expect(log).eql([
                        'start action: useRole',
                        '---- start command: execute-client-function',
                        '---- done command: execute-client-function',
                        '---- start command: navigate-to',
                        '---- done command: navigate-to',
                        'start action: click',
                        '---- start command: click',
                        '---- done command: click',
                        'done action: click',
                        '---- start command: backup-storages',
                        '---- done command: backup-storages',
                        '---- start command: navigate-to',
                        '---- done command: navigate-to',
                        'done action: useRole',
                        '---- start command: test-done',
                        '---- done command: test-done'
                    ]);
                });
        });

        it('Complex command sequence', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log)
            };

            return runTests('testcafe-fixtures/index-test.js', 'Complex command sequence', runOpts)
                .then(() => {
                    expect(log).eql([
                        'start action: useRole',
                        '---- start command: execute-client-function',
                        '---- done command: execute-client-function',
                        '---- start command: navigate-to',
                        '---- done command: navigate-to',
                        '---- start command: backup-storages',
                        '---- done command: backup-storages',
                        '---- start command: navigate-to',
                        '---- done command: navigate-to',
                        'done action: useRole',

                        'start action: useRole',
                        '---- start command: execute-client-function',
                        '---- done command: execute-client-function',
                        // NOTE: some extra `backup` command, because of role switching
                        '---- start command: backup-storages',
                        '---- done command: backup-storages',
                        '---- start command: navigate-to',
                        '---- done command: navigate-to',
                        '---- start command: backup-storages',
                        '---- done command: backup-storages',
                        '---- start command: navigate-to',
                        '---- done command: navigate-to',
                        'done action: useRole',

                        '---- start command: test-done',
                        '---- done command: test-done'
                    ]);
                });
        });

        it('All actions', function () {
            const log = [];

            const runOpts = {
                only:     ['chrome'],
                reporter: generateReport(log, true)
            };

            return runTests('testcafe-fixtures/index-test.js', 'All actions', runOpts)
                .then(() => {
                    expect(log).eql(
                        [
                            // await t.click('#target')
                            'start action: click',
                            'done action: click',
                            // await t.rightClick('#target');
                            'start action: right-click',
                            'done action: right-click',
                            // await t.doubleClick('#target');
                            'start action: double-click',
                            'done action: double-click',
                            // await t.hover('#target');
                            'start action: hover',
                            'done action: hover',
                            // await t.drag('#target', 100, 200);
                            'start action: drag',
                            'done action: drag',
                            // await t.dragToElement('#target', '#target');
                            'start action: drag-to-element',
                            'done action: drag-to-element',
                            // await t.typeText('#input', 'text');
                            'start action: type-text',
                            'done action: type-text',
                            // await t.selectText('#input', 1, 3);
                            'start action: select-text',
                            'done action: select-text',
                            // await t.selectTextAreaContent('#textarea', 1, 1, 2, 2);
                            'start action: select-text-area-content',
                            'done action: select-text-area-content',
                            // await t.selectEditableContent('#contenteditable', '#contenteditable');
                            'start action: select-editable-content',
                            'done action: select-editable-content',
                            // await t.pressKey('enter');
                            'start action: press-key',
                            'done action: press-key',
                            // await t.wait(1);
                            'start action: wait',
                            'done action: wait',
                            // await t.navigateTo('./index.html');
                            'start action: navigate-to',
                            'done action: navigate-to',
                            // await t.setFilesToUpload('#file', '../test.js');
                            'start action: set-files-to-upload',
                            'done action: set-files-to-upload',
                            // await t.clearUpload('#file');
                            'start action: clear-upload',
                            'done action: clear-upload',
                            // await t.takeScreenshot();
                            'start action: take-screenshot',
                            'done action: take-screenshot',
                            // await t.takeElementScreenshot('#target');
                            'start action: take-element-screenshot',
                            'done action: take-element-screenshot',
                            // await t.resizeWindow(200, 200);
                            'start action: resize-window',
                            'done action: resize-window',
                            // await t.resizeWindowToFitDevice('Sony Xperia Z', { portraitOrientation: true });
                            'start action: resize-window-to-fit-device',
                            'done action: resize-window-to-fit-device',
                            // await t.maximizeWindow();
                            'start action: maximize-window',
                            'done action: maximize-window',
                            // await t.switchToIframe('#iframe');
                            'start action: switch-to-iframe',
                            'done action: switch-to-iframe',
                            // await t.switchToMainWindow();
                            'start action: switch-to-main-window',
                            'done action: switch-to-main-window',
                            // await t.eval(() => console.log('log'));
                            'start action: eval',
                            'done action: eval',
                            // await t.setNativeDialogHandler(() => true);
                            'start action: set-native-dialog-handler',
                            'done action: set-native-dialog-handler',
                            // await t.getNativeDialogHistory();
                            'start action: get-native-dialog-history',
                            'done action: get-native-dialog-history',
                            // await t.getBrowserConsoleMessages();
                            'start action: get-browser-console-messages',
                            'done action: get-browser-console-messages',
                            // await t.expect(true).eql(true);
                            'start action: eql',
                            'done action: eql',
                            // await t.setTestSpeed(1);
                            'start action: set-test-speed',
                            'done action: set-test-speed',
                            // await t.setPageLoadTimeout(1);
                            'start action: set-page-load-timeout',
                            'done action: set-page-load-timeout',
                            // await t.useRole(Role.anonymous());
                            'start action: useRole',
                            'done action: useRole'
                        ]
                    );
                });
        });
    });
});
