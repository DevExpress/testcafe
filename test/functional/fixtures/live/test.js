const { noop }       = require('lodash');
const createTestCafe = require('../../../../lib');
const config         = require('../../config');
const path           = require('path');
const { expect }     = require('chai');
const helper         = require('./test-helper');

const DEFAULT_BROWSERS = ['chrome', 'firefox'];
let cafe               = null;

function createLiveModeRunner (tc, src, browsers = DEFAULT_BROWSERS) {
    const runner = tc.createLiveModeRunner();

    runner.controller._listenKeyPress   = () => { };
    runner.controller._initFileWatching = () => { };
    runner.controller.dispose           = () => { };

    src = path.join(__dirname, src);

    return runner
        .src(src)
        .browsers(browsers)
        .reporter(() => {
            return {
                reportTaskStart:    noop,
                reportTaskDone:     noop,
                reportTestDone:     noop,
                reportFixtureStart: noop
            };
        });
}

if (config.useLocalBrowsers && !config.useHeadlessBrowsers) {
    describe('Live Mode', () => {
        it('Smoke', () => {
            const runCount = 2;

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    cafe = tc;
                })
                .then(() => {
                    const runner = createLiveModeRunner(cafe, '/testcafe-fixtures/smoke.js');

                    helper.watcher.once('test-complete', () => {
                        setTimeout(() => {
                            runner.controller._restart()
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

                    helper.watcher.once('test-complete', () => {
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

                    helper.watcher.once('test-complete', () => {
                        setTimeout(() => {
                            runner.controller._restart().then(() => {
                                expect(Object.keys(helper.data).length).eql(2);
                                expect(helper.data[0]).eql(true);
                                expect(helper.data[1]).eql(true);

                                helper.data = {};

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
    });
}
