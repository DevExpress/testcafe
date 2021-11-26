const { expect }       = require('chai');
const CDP              = require('chrome-remote-interface');
const express          = require('express');
const { readFileSync } = require('fs');
const { start }        = require('../../lib/browser/provider/built-in/dedicated/chrome/local-chrome');
const delay            = require('../../lib/utils/delay');
const { join }         = require('path');
const ExecutionContext = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/execution-context');

const {
    getClientPosition,
    getClientDimensions,
    containsOffset,
    getIframeClientCoordinates,
    getIframePointRelativeToParentFrame,
    isInRectangle,
} = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/utils');

const page  = readFileSync(join(__dirname, './position-utils-test-page.html')).toString();
const frame = readFileSync(join(__dirname, './position-utils-test-iframe.html')).toString();

let client = null;
let server = null;

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

async function setScroll ({ Runtime }, selector, { top, left }) {
    await Runtime.evaluate({ expression: `${selector}.scrollTo({ top: ${top}, left: ${left} });` });
}

describe('.createRunnableConfiguration()', () => {
    before(async () => {
        server = createServer();

        const runtimeInfo = { config: {}, cdpPort: 9225, browserName: 'chrome', tempProfileDir: { path: '' } };

        await start('about:blank', runtimeInfo);
        await delay(2000);

        client = await CDP({ port: 9225 });

        await client.Runtime.enable();
        await client.Page.enable();
        await client.DOM.enable();
        await client.CSS.enable();

        ExecutionContext.initialize(client);

        await client.Page.navigate({ url: 'http://localhost:3000' });

        await delay(2000);
    });

    after(async () => {
        await client.Browser.close();
        await server.close();
    });

    beforeEach(async () => {
        await setScroll(client, 'window', { top: 0, left: 0 });
        await setScroll(client, 'document.querySelector(\'#scrollableDiv\')', { top: 0, left: 0 });
    });

    it('getClientPosition', async () => {
        const el1 = '#target1';
        const el2 = '#target2';
        const el3 = '#target3';

        let position1 = await getClientPosition(client, el1);
        let position2 = await getClientPosition(client, el2);
        let position3 = await getClientPosition(client, el3);

        expect(position1).eql({ x: 31, y: 26 });
        expect(position2).eql({ x: 227, y: 207 });
        expect(position3).eql({ x: 31, y: 1506 });

        await setScroll(client, 'window', { top: 300, left: 0 });

        position1 = await getClientPosition(client, el1);
        position2 = await getClientPosition(client, el2);
        position3 = await getClientPosition(client, el3);

        expect(position1).eql({ x: 31, y: -274 });
        expect(position2).eql({ x: 227, y: -93 });
        expect(position3).eql({ x: 31, y: 1206 });

        await setScroll(client, 'window', { top: 600, left: 100 });

        position1 = await getClientPosition(client, el1);
        position2 = await getClientPosition(client, el2);
        position3 = await getClientPosition(client, el3);

        expect(position1).eql({ x: -69, y: -574 });
        expect(position2).eql({ x: 127, y: -393 });
        expect(position3).eql({ x: -69, y: 906 });
    });

    it('getClientDimensions', async () => {
        let node       = null;
        let dimensions = await getClientDimensions(client, 'html');

        expect(dimensions.border).eql({ bottom: 0, left: 0, right: 0, top: 0 });
        expect(dimensions.bottom).eql(dimensions.height);
        expect(dimensions.left).eql(0);
        expect(dimensions.top).eql(0);
        expect(dimensions.right).eql(dimensions.width);
        expect(dimensions.scroll).eql({ left: 0, top: 0 });

        dimensions = await getClientDimensions(client, '#target1');

        expect(dimensions).eql({
            border: {
                bottom: 5,
                left:   5,
                right:  5,
                top:    5,
            },
            bottom: 70,
            height: 44,
            left:   31,
            right:  65,
            scroll: {
                left: 0,
                top:  0,
            },
            scrollbar: {
                bottom: 0,
                right:  0,
            },
            paddings: {
                bottom: 7,
                left:   7,
                right:  7,
                top:    7,
            },
            top:   26,
            width: 34,
        });

        dimensions = await getClientDimensions(client, '#target2');

        expect(dimensions).eql({
            border: {
                bottom: 3,
                left:   1,
                right:  2,
                top:    4,
            },
            bottom: 248,
            height: 41,
            left:   227,
            right:  254,
            scroll: {
                left: 0,
                top:  0,
            },
            scrollbar: {
                bottom: 0,
                right:  0,
            },
            paddings: {
                bottom: 7,
                left:   7,
                right:  7,
                top:    7,
            },
            top:   207,
            width: 27,
        });

        await setScroll(client, 'document.querySelector(\'#scrollableDiv\')', { top: 20, left: 10 });

        dimensions = await getClientDimensions(client, '#target2');

        expect(dimensions).eql({
            border: {
                bottom: 3,
                left:   1,
                right:  2,
                top:    4,
            },
            bottom: 228,
            height: 41,
            left:   217,
            right:  244,
            scroll: {
                left: 0,
                top:  0,
            },
            scrollbar: {
                bottom: 0,
                right:  0,
            },
            paddings: {
                bottom: 7,
                left:   7,
                right:  7,
                top:    7,
            },
            top:   187,
            width: 27,
        });

        dimensions = await getClientDimensions(client, '#scrollableDiv');

        expect(dimensions).eql({
            border: {
                bottom: 1,
                left:   1,
                right:  1,
                top:    1,
            },
            bottom: 158,
            height: 108,
            left:   70,
            right:  178,
            scroll: {
                left: 10,
                top:  20,
            },
            scrollbar: {
                bottom: 17,
                right:  17,
            },
            paddings: {
                bottom: 3,
                left:   3,
                right:  3,
                top:    3,
            },
            top:   50,
            width: 108,
        });

        node       = await client.Runtime.evaluate({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'div\')' });
        dimensions = await getClientDimensions(client, node);

        expect(dimensions).eql({
            border: {
                bottom: 0,
                left:   0,
                right:  0,
                top:    0,
            },
            bottom: 26,
            height: 18,
            left:   8,
            right:  75,
            scroll: {
                left: 0,
                top:  0,
            },
            scrollbar: {
                bottom: 0,
                right:  0,
            },
            paddings: {
                bottom: 0,
                left:   0,
                right:  0,
                top:    0,
            },
            top:   8,
            width: 67,
        });
    });

    it('containsOffset', async () => {
        const selector = '#scrollableDiv';

        expect(await containsOffset(client, selector, 10, void 0)).eql(true);
        expect(await containsOffset(client, selector, void 0, 10)).eql(true);
        expect(await containsOffset(client, selector, -1, -1)).eql(false);
        expect(await containsOffset(client, selector, 10, 10)).eql(true);
        expect(await containsOffset(client, selector, 200, 200)).eql(true);
        expect(await containsOffset(client, selector, 220, 220)).eql(false);
    });

    it('getIframeClientCoordinates', async () => {
        expect(await getIframeClientCoordinates(client, 'iframe')).eql({
            bottom: 405,
            left:   305,
            right:  405,
            top:    304,
        });

        const nestedIFrame = await client.Runtime.evaluate({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'iframe\')' });

        expect(await getIframeClientCoordinates(client, nestedIFrame)).eql({
            bottom: 178,
            left:   10,
            right:  310,
            top:    28,
        });
    });

    it('getIframePointRelativeToParentFrame', async () => {
        const point1 = await getIframePointRelativeToParentFrame(client, { x: 42, y: 17 }, ExecutionContext.top.children[0]);
        const point2 = await getIframePointRelativeToParentFrame(client, { x: 1, y: 1 }, ExecutionContext.top.children[0].children[0]);

        await setScroll(client, 'window', { left: 100, top: 50 });
        await setScroll(client, 'document.querySelector(\'iframe\').contentDocument.scrollingElement', { left: 50, top: 10 });

        const point3 = await getIframePointRelativeToParentFrame(client, { x: 42, y: 17 }, ExecutionContext.top.children[0]);
        const point4 = await getIframePointRelativeToParentFrame(client, { x: 1, y: 1 }, ExecutionContext.top.children[0].children[0]);

        expect(point1).eql({ x: 347, y: 321 });
        expect(point2).eql({ x: 11, y: 29 });
        expect(point3).eql({ x: 247, y: 271 });
        expect(point4).eql({ x: -39, y: 19 });
    });

    it('isInRectangle', async () => {
        expect(isInRectangle({ x: 10, y: 20 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(true);
        expect(isInRectangle({ x: 0, y: 0 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(true);
        expect(isInRectangle({ x: 0, y: 50 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(true);
        expect(isInRectangle({ x: 50, y: 0 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(true);
        expect(isInRectangle({ x: 50, y: 50 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(true);
        expect(isInRectangle({ x: -1, y: 0 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(false);
        expect(isInRectangle({ x: 51, y: 0 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(false);
        expect(isInRectangle({ x: 0, y: -1 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(false);
        expect(isInRectangle({ x: 0, y: 51 }, { left: 0, right: 50, top: 0, bottom: 50 })).eql(false);
    });
});
