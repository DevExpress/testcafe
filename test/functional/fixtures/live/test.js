const { noop }           = require('lodash');
const createTestCafe     = require('../../../../lib');
const config             = require('../../config');
const path               = require('path');
const { Buffer }         = require('buffer');
const { expect }         = require('chai');
const helper             = require('./test-helper');
const { createReporter } = require('../../utils/reporter');
const fs                 = require('fs');
const del                = require('del');
const osFamily           = require('os-family');

let cafe = null;

const LiveModeController            = require('../../../../lib/live/controller');
const LiveModeRunner                = require('../../../../lib/live/test-runner');
const LiveModeKeyboardEventObserver = require('../../../../lib/live/keyboard-observer');


class LiveModeKeyboardEventObserverMock extends LiveModeKeyboardEventObserver {
    _listenKeyEvents () {
    }
}

class ControllerMock extends LiveModeController {
    constructor (runner) {
        super(runner);

        this.logger = {
            writeIntroMessage:          noop,
            writeStopRunningMessage:    noop,
            writeTestsFinishedMessage:  noop,
            writeRunTestsMessage:       noop,
            writeToggleWatchingMessage: noop,
            writeExitMessage:           noop,
        };
    }

    _createKeyboardObserver () {
        return new LiveModeKeyboardEventObserverMock();
    }
}

class RunnerMock extends LiveModeRunner {
    _createController () {
        return new ControllerMock(this);
    }
}

function createTestCafeInstance (opts = {}) {
    return createTestCafe({ ...opts })
        .then(tc => {
            cafe = tc;
        });
}

function createLiveModeRunner (tc, src) {
    const { proxy, browserConnectionGateway, configuration } = tc;

    const runner = new RunnerMock({
        proxy,
        browserConnectionGateway,
        configuration: configuration.clone(),
    });

    tc.runners.push(runner);

    const browsers = config.browsers.map(browserInfo => browserInfo.browserName);

    return runner
        .src(path.join(__dirname, src))
        .browsers(browsers)
        .reporter(createReporter());
}

if (config.useLocalBrowsers && !config.hasBrowser('safari')) {
    describe('Live Mode', () => {
        afterEach(() => {
            helper.clean();
        });

        it('Smoke', () => {
            const runCount = 2;

            return createTestCafeInstance()
                .then(() => {
                    const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/smoke.js');

                    helper.emitter.once('tests-completed', () => {
                        setTimeout(() => {
                            runner.controller.restart()
                                .then(() => {
                                    runner.exit();
                                });
                        }, 1000);
                    });

                    return runner.run({ disableNativeAutomation: !config.nativeAutomation });
                })
                .then(() => {
                    expect(helper.counter).eql(config.browsers.length * helper.testCount * runCount);

                    return cafe.close();
                });
        });

        it('Quarantine', () => {
            return createTestCafeInstance()
                .then(() => {
                    const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/quarantine.js');

                    helper.emitter.once('tests-completed', () => {
                        setTimeout(() => {
                            runner.exit();
                        }, 1000);
                    });

                    return runner.run({
                        quarantineMode:          true,
                        disableNativeAutomation: !config.nativeAutomation,
                    });
                })
                .then(() => {
                    expect(helper.attempts).eql(config.browsers.length * helper.quarantineThreshold);

                    return cafe.close();
                });
        });

        it('Client scripts', () => {
            return createTestCafeInstance()
                .then(() => {
                    const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/client-scripts.js', ['chrome']);

                    helper.emitter.once('tests-completed', () => {
                        setTimeout(() => {
                            runner.controller.restart().then(() => {
                                expect(Object.keys(helper.data).length).eql(2);
                                expect(helper.data[0]).eql(true);
                                expect(helper.data[1]).eql(true);

                                runner.exit();
                            });
                        }, 1000);
                    });

                    return runner.run({ disableNativeAutomation: !config.nativeAutomation });
                })
                .then(() => {
                    return cafe.close();
                });
        });

        it('Same runner stops and then runs again with other settings', function () {
            let finishTest = null;

            const promise = new Promise(resolve => {
                finishTest = resolve;
            });


            createTestCafeInstance()
                .then(() => {
                    const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/test-1.js');

                    setTimeout(() => {
                        return runner.stop()
                            .then(() => {
                                helper.emitter.once('tests-completed', () => {
                                    runner.exit();
                                });

                                return runner
                                    .browsers(config.browsers.map(browserInfo => browserInfo.browserName))
                                    .src(path.join(__dirname, '/testcafe-fixtures/test-2.js'))
                                    .run({ disableNativeAutomation: !config.nativeAutomation })
                                    .then(() => {
                                        return cafe.close();
                                    })
                                    .then(() => {
                                        finishTest();
                                    });
                            });
                    }, 10000);

                    return runner
                        .run({ disableNativeAutomation: !config.nativeAutomation });
                });

            return promise;
        });

        it('Should rerun tests after changing file', async function () {
            const relativeFilePath = '/testcafe-fixtures/watch-test-file.js';
            const filePath         = path.join(__dirname, relativeFilePath);
            const fileHandle       = await fs.promises.open(filePath, 'w');
            const firstPartTests   = Buffer.from('import helper from "../test-helper";\n' +
                '\n' +
                'fixture `Should rerun tests after changing file`\n' +
                '    .page `../pages/index.html`\n' +
                '    .after(() => {\n' +
                '        helper.emitter.emit("tests-completed");\n' +
                '    });\n' +
                '\n' +
                'test("Old test", async t => {\n' +
                '    for (let i = 0; i < 10; i++)\n' +
                '        await t.click("#button1");\n' +
                '});' +
                '\n');

            await fileHandle.write(firstPartTests);
            await fileHandle.sync();

            await createTestCafeInstance();

            const runner = createLiveModeRunner(cafe, relativeFilePath, ['chrome']);

            helper.emitter.once('tests-completed', async () => {
                helper.emitter.once('tests-completed', () => {
                    runner.exit();
                    del([filePath]);
                });

                const secondPartTests = Buffer.from('\n' +
                    'test("New test", async t => {\n' +
                    '    for (let i = 0; i < 10; i++)\n' +
                    '        await t.click("#button2");\n' +
                    '});' +
                    '\n');

                await fileHandle.write(secondPartTests);
                await fileHandle.sync();
            });

            return runner
                .run({ disableNativeAutomation: !config.nativeAutomation })
                .then(() => {
                    return cafe.close();
                });
        });

        // NOTE: This task must be run in headed browser. Otherwise, it will be passed even with incorrect result
        (!config.useHeadlessBrowsers && !osFamily.mac ? it : it.skip)('Selector Inspector should indicate the correct number of elements matching the selector in live mode', async () => {
            await createTestCafeInstance();

            const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/selector-inspector.js');

            helper.emitter.once('tests-completed', () => {
                setTimeout(() => {
                    runner.controller.restart().then(() => runner.exit());
                }, 1000);
            });

            await runner.run({ disableNativeAutomation: !config.nativeAutomation });

            return cafe.close();
        });
    });
}

