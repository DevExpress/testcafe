const http           = require('http');
const path           = require('path');
const fs             = require('fs');
const createTestCafe = require('../../../../../../lib');
const config         = require('../../../../config');
const { expect }     = require('chai');
const enableDestroy  = require('server-destroy');

const resourceRequestCounter = {
    script1: 0,
    script2: 0,
    img:     0
};

function resolvePath (file) {
    return path.join(__dirname, file);
}

function readFileContent (file) {
    return fs.readFileSync(resolvePath(file)).toString();
}

function addCachingHeader (res) {
    res.setHeader('cache-control', 'max-age=86400'); // Cache response 1 day
}

function createServer () {
    const server = http.createServer((req, res) => {
        let content = '';

        if (req.url === '/')
            content = readFileContent('./page/index.html');

        else if (req.url === '/script-1.js') {
            resourceRequestCounter.script1++;

            addCachingHeader(res);

            content = readFileContent('./page/script-1.js');
        }
        else if (req.url === '/script-2.js') {
            resourceRequestCounter.script2++;

            addCachingHeader(res);
            res.setHeader('X-Checked-Header', 'TesT');
            res.setHeader('content-type', 'application/javascript; charset=utf-8');

            content = readFileContent('./page/script-2.js');
        }
        else if (req.url === '/img.png') {
            resourceRequestCounter.img++;

            addCachingHeader(res);
            res.setHeader('content-type', 'image/png');
            fs.createReadStream(resolvePath('./page/img.png')).pipe(res);

            return;
        }

        res.end(content);
    });

    server.listen(1340);

    enableDestroy(server);

    return server;
}

async function run ({ src, browser }) {
    const testcafe = await createTestCafe({
        hostname: 'localhost',
        port1:    1335,
        port2:    1336,
        cache:    true
    });

    await testcafe.createRunner()
        .src(path.join(__dirname, src))
        .browsers(browser)
        .run();

    await testcafe.close();
}

const isLocalChrome = config.useLocalBrowsers && config.browsers.some(browser => browser.alias.includes('chrome'));

if (isLocalChrome) {
    describe('Cache', () => {
        it('Should cache resources between tests', () => {
            const server = createServer();

            return run({ src: './testcafe-fixtures/index.js', browser: 'chrome' })
                .then(() => {
                    server.destroy();

                    expect(resourceRequestCounter.script1).eql(1);
                    expect(resourceRequestCounter.script2).eql(1);
                    expect(resourceRequestCounter.img).eql(1);
                });
        });
    });
}
