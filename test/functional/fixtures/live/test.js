const createTestCafe = require('../../../../lib');
const config         = require('../../config');
const path           = require('path');
const watcher        = require('./test-watcher').watcher;

if (config.useLocalBrowsers && !config.useHeadlessBrowsers) {
    describe('Live smoke', () => {
        it('Live smoke', () => {
            let cafe = null;

            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(tc => {
                    cafe = tc;
                })
                .then(() => {
                    const runner      = cafe.createLiveModeRunner();
                    const fixturePath = path.join(__dirname, '/testcafe-fixtures/index-test.js');

                    runner.controller._listenKeyPress   = () => { };
                    runner.controller._initFileWatching = () => { };
                    runner.controller.dispose           = () => { };

                    watcher.once('test-complete', () => {
                        runner.exit();
                    });

                    return runner
                        .src(fixturePath)
                        .browsers('chrome')
                        .run();
                })
                .then(() => {
                    return cafe.close();
                });
        });
    });
}
