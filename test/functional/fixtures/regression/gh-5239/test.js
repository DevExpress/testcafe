const http                       = require('http');
const path                       = require('path');
const config                     = require('../../../config');
const createTestCafe             = require('../../../../../lib');
const { getFreePort }            = require('../../../../../lib/utils/endpoint-utils');
const { skipInNativeAutomation } = require('../../../utils/skip-in');

const ERROR_RESPONSE_COUNT        = 8;
const SIGNIFICANT_REQUEST_TIMEOUT = 200;

let previousRequestTime = null;

async function createServer () {
    let requestCounter = 0;

    const requestListener = function (req, res) {
        const now = Date.now();

        // NOTE: consider only those requests, that were sent with interval more than 100ms
        if (previousRequestTime && now - previousRequestTime > SIGNIFICANT_REQUEST_TIMEOUT)
            requestCounter++;

        previousRequestTime = now;

        if (requestCounter < ERROR_RESPONSE_COUNT)
            req.destroy();
        else {
            res.writeHead(200);
            res.end('<h1>example</h1>');
        }
    };

    const server = http.createServer(requestListener);
    const port   = await getFreePort();

    process.env.TEST_SERVER_PORT = port.toString();

    server.listen(port);

    return server;
}

async function run ({ src, browsers, retryTestPages, reporter }) {
    const testcafe = await createTestCafe('localhost', 1335, 1336, void 0, true, retryTestPages);
    const runner   = testcafe.createRunner();

    await runner
        .src(path.join(__dirname, src))
        .browsers(browsers);

    if (reporter)
        runner.reporter(reporter);

    await runner.run({ disableNativeAutomation: !config.nativeAutomation });

    await testcafe.close();
}

const isLocalChrome = config.useLocalBrowsers && config.browsers.some(browser => browser.alias.indexOf('chrome') > -1);

describe('[Regression](GH-5239)', function () {
    if (isLocalChrome) {
        skipInNativeAutomation('Should make multiple request for the page if the server does not respond', async function () {
            this.timeout(30000);

            const server = await createServer();

            return run({ retryTestPages: true, browsers: 'chrome --headless', src: './testcafe-fixtures/index.js' })
                .then(() => {
                    server.close();
                });
        });
    }
});
