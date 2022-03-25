const { noop }           = require('lodash');
const createTestCafe     = require('../../../../lib');
const config             = require('../../config');
const path               = require('path');
const { Buffer }         = require('buffer');
const { expect }         = require('chai');
const helper             = require('./test-helper');
const { createReporter } = require('../../utils/reporter');
const fs                 = require( 'fs' );
const del                = require('del');

const DEFAULT_BROWSERS = ['chrome', 'firefox'];
let cafe               = null;

const LiveModeController            = require('../../../../lib/live/controller');
const LiveModeRunner                = require('../../../../lib/live/test-runner');
const LiveModeKeyboardEventObserver = require('../../../../lib/live/keyboard-observer');
const ProcessTitle                  = require('../../../../lib/services/process-title');


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

function createLiveModeRunner (tc, src, browsers = DEFAULT_BROWSERS) {
    const { proxy, browserConnectionGateway, configuration, compilerService } = tc;

    const runner = new RunnerMock({
        proxy,
        browserConnectionGateway,
        configuration: configuration.clone(),
        compilerService,
    });

    tc.runners.push(runner);

    return runner
        .src(path.join(__dirname, src))
        .browsers(browsers)
        .reporter(createReporter());
}

const testingEnvironmentName = process.env.TESTING_ENVIRONMENT;

if (config.useLocalBrowsers && !config.useHeadlessBrowsers) {
    // TODO: stabilize tests in IE
    (config.hasBrowser('ie') ? describe.skip : describe)('Live Mode', () => {
        afterEach (() => {
            helper.clean();
        });

        it('Smoke', () => {
            const runCount = 2;

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    cafe = tc;
                })
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

                    return runner.run();
                })
                .then(() => {
                    expect(helper.counter).eql(DEFAULT_BROWSERS.length * helper.testCount * runCount);

                    return cafe.close();
                });
        });

        it('Quarantine', () => {
            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    cafe = tc;
                })
                .then(() => {
                    const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/quarantine.js');

                    helper.emitter.once('tests-completed', () => {
                        setTimeout(() => {
                            runner.exit();
                        }, 1000);
                    });

                    return runner.run({
                        quarantineMode: true,
                    });
                })
                .then(() => {
                    expect(helper.attempts).eql(DEFAULT_BROWSERS.length * helper.quarantineThreshold);

                    return cafe.close();
                });
        });

        it('Client scripts', () => {
            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    cafe = tc;
                })
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

                    return runner.run();
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


            createTestCafe('localhost', 1337, 1338)
                .then(tc => {
                    cafe         = tc;
                    const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/test-1.js', ['chrome']);

                    setTimeout(() => {
                        return runner.stop()
                            .then(() => {
                                helper.emitter.once('tests-completed', () => {
                                    runner.exit();
                                });

                                return runner
                                    .browsers(['firefox'])
                                    .src(path.join(__dirname, '/testcafe-fixtures/test-2.js'))
                                    .run()
                                    .then(() => {
                                        return cafe.close();
                                    })
                                    .then(() => {
                                        finishTest();
                                    });
                            });
                    }, 10000);

                    return runner
                        .run();
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

            cafe         = await createTestCafe( 'localhost', 1337, 1338 );
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
                .run()
                .then(() => {
                    return cafe.close();
                });
        });
    });
}
else if (testingEnvironmentName === 'local-headless-chrome') {
    describe('Live Mode', () => {
        it('Experimental debug', () => {
            const markerFile = path.join(__dirname, 'testcafe-fixtures', '.test-completed.marker');

            return createTestCafe({
                hostname:          '127.0.0.1',
                port1:             1335,
                port2:             1336,
                experimentalDebug: true,
            })
                .then(tc => {
                    cafe = tc;
                })
                .then(() => {
                    const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/experimental-debug.js', [config.currentEnvironment.browsers[0].browserName]);

                    const timeoutId = setTimeout(() => {
                        clearInterval(intervalId); // eslint-disable-line @typescript-eslint/no-use-before-define
                        runner.exit();

                        expect.fail('Marker file not found.');
                    }, 20000);

                    const intervalId = setInterval(async () => {
                        if (!fs.existsSync(markerFile))
                            return;

                        const inTestProcessName = fs.readFileSync(markerFile).toString();

                        await new Promise(resolve => setTimeout(resolve, 3000));

                        clearTimeout(timeoutId);
                        clearInterval(intervalId);
                        runner.exit();

                        expect(inTestProcessName).eql(ProcessTitle.service);
                    }, 1000);

                    return runner.run();
                })
                .then(() => {
                    if (fs.existsSync(markerFile))
                        fs.unlinkSync(markerFile);

                    return cafe.close();
                });
        });
    });
}


