const http                  = require('https');
const path                  = require('path');
const config                = require('../../../config');
const createTestCafe        = require('../../../../../lib');
const selfSignedSertificate = require('openssl-self-signed-certificate');

const ERROR_RESPONSE_COUNT        = 10;
const SIGNIFICANT_REQUEST_TIMEOUT = 100;

const sslOptions = {
    key:  selfSignedSertificate.key,
    cert: selfSignedSertificate.cert
};

let previousRequestTime = null;

function createServer () {
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

    const server = http.createServer(sslOptions, requestListener);

    server.listen(1340);

    return server;
}

async function run () {
    const testcafe = await createTestCafe('localhost', 1335, 1336, sslOptions, true, true);
    const runner   = testcafe.createRunner();

    await runner
        .src(path.join(__dirname, './testcafe-fixtures/index.js'))

        // Browsers restrict self-signed certificate usage unless you
        // explicitly set a flag specific to each browser.
        // For Chrome, this is '--allow-insecure-localhost'.
        .browsers('chrome --allow-insecure-localhost --ignore-certificate-errors')
        .run();

    await testcafe.close();
}

const isLocalChrome = config.useLocalBrowsers && config.browsers.some(browser => browser.alias.indexOf('chrome') > -1);

if (isLocalChrome) {
    describe('[Regression](GH-5239)', function () {
        it('Should make multiple request for the page if the server does not respond', function () {
            this.timeout(30000);

            const server = createServer();

            return run()
                .then(() => {
                    return server.close();
                });
        });
    });
}
