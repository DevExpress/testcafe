const CDP              = require('chrome-remote-interface');
const express          = require('express');
const { readFileSync } = require('fs');
const { join }         = require('path');
const delay            = require('../../lib/utils/delay');
const ExecutionContext = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/execution-context');
const ChromeLauncher   = require('chrome-launcher');
const clientsManager   = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/clients-manager');

const page  = readFileSync(join(__dirname, './position-utils-test-page.html')).toString();
const frame = readFileSync(join(__dirname, './position-utils-test-iframe.html')).toString();

let server = null;
let client = null;

function createServer () {
    const app  = express();
    const port = 3000;

    app.get('/', (req, res) => {
        res.send(page);
    });

    app.get('/frame', (req, res) => {
        res.send(frame);
    });

    return app.listen(port, () => {
    });
}

async function attachCDP (port) {
    let result = null;

    for (let i = 0; i < 10; i++) {
        try {
            await delay(2000);

            result = await CDP({ port });

            break;
        }
        catch (err) {
            //
        }
    }

    return result;
}

async function before () {
    server = createServer();

    const chrome = await ChromeLauncher.launch({
        startingUrl: 'about:blank',
        chromeFlags: [
            '--headless',
            '--no-first-run',
            '--disable-gpu',
            '--no-sandbox',
        ],
    });

    client = await attachCDP(chrome.port);

    clientsManager.setClient(client);

    await client.Runtime.enable();
    await client.Page.enable();
    await client.DOM.enable();
    await client.CSS.enable();
    await client.Overlay.enable();

    ExecutionContext.initialize(client);

    await client.Page.navigate({ url: 'http://localhost:3000' });

    await delay(2000);
}

async function after () {
    await client.Browser.close();
    await server.close();
}

async function beforeEach () {
    await setScroll('window', { top: 0, left: 0 });
    await setScroll('document.querySelector(\'#scrollableDiv\')', { top: 0, left: 0 });
    await setScroll('document.querySelector(\'iframe\').contentDocument.scrollingElement', { left: 0, top: 0 });
}

async function setScroll (selector, { top, left }) {
    await clientsManager.getClient().Runtime.evaluate({ expression: `${selector}.scrollTo({ top: ${top}, left: ${left} });` });
}

async function getNode (args) {
    const { Runtime, DOM } = clientsManager.getClient();

    args = typeof args === 'string' ? await Runtime.evaluate({ expression: `document.querySelector('${args}')` }) : args;

    if (args.expression)
        args = await Runtime.evaluate({ expression: args.expression });

    const objectId = args.result?.objectId || '';
    const { node } = await DOM.describeNode({ objectId });

    node.objectId = objectId;

    return node;
}

module.exports.createServer = createServer;
module.exports.before       = before;
module.exports.after        = after;
module.exports.beforeEach   = beforeEach;
module.exports.setScroll    = setScroll;
module.exports.getClient    = () => client;
module.exports.getNode      = getNode;
