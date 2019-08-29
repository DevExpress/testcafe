const { noop }       = require('lodash');
const createTestCafe = require('../../../../lib');
const config         = require('../../config');
const path           = require('path');
const { expect }     = require('chai');
const helper         = require('./test-helper');

const browsers = ['chrome', 'firefox'];
let cafe       = null;

function createRunner (tc, src) {
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
    describe('Live Mode tests', () => {
        it('Live smoke', () => {
            const runCount = 2;

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    cafe = tc;
                })
                .then(() => {
                    const runner = createRunner(cafe, '/testcafe-fixtures/smoke.js');

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
                    expect(helper.counter).eql(browsers.length * helper.testCount * runCount);

                    return cafe.close();
                });
        });

        it('Live quarantine', () => {
            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    cafe = tc;
                })
                .then(() => {
                    const runner = createRunner(cafe, '/testcafe-fixtures/quarantine.js');

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
                    expect(helper.attempts).eql(browsers.length * helper.quarantineThreshold);

                    return cafe.close();
                });
        });
    });
}
