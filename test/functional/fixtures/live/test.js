const { noop }           = require('lodash');
const createTestCafe     = require('../../../../lib');
const config             = require('../../config');
const path               = require('path');
const { expect }         = require('chai');
const helper             = require('./test-helper');
const { createReporter } = require('../../utils/reporter');

const DEFAULT_BROWSERS = ['chrome', 'firefox'];
let cafe               = null;

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

function createLiveModeRunner (tc, src, browsers = DEFAULT_BROWSERS) {
    const { proxy, browserConnectionGateway, configuration } = tc;

    const runner = new RunnerMock({
        proxy,
        browserConnectionGateway,
        configuration: configuration.clone()
    });

    tc.runners.push(runner);

    return runner
        .src(path.join(__dirname, src))
        .browsers(browsers)
        .reporter(createReporter());
}

if (config.useLocalBrowsers && !config.useHeadlessBrowsers) {
    describe('Live Mode', () => {
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
                        quarantineMode: true
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
    });
}
