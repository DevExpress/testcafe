const { expect }              = require('chai');
const ExecutionContext        = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/execution-context');
const { getClientDimensions } = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/utils/style-utils');

const utils = require('./utils');

const {
    getClientPosition,
    containsOffset,
    getIframeClientCoordinates,
    getIframePointRelativeToParentFrame,
    getOffsetPosition,
} = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/utils/position-utils');

describe('position utils', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    it('getClientPosition', async () => {
        const el1 = '#target1';
        const el2 = '#target2';
        const el3 = '#target3';

        let position1 = await getClientPosition(utils.getClient(), el1);
        let position2 = await getClientPosition(utils.getClient(), el2);
        let position3 = await getClientPosition(utils.getClient(), el3);

        expect(position1).eql({ x: 31, y: 26 });
        expect(position2).eql({ x: 227, y: 207 });
        expect(position3).eql({ x: 31, y: 1506 });

        await utils.setScroll(utils.getClient(), 'window', { top: 300, left: 0 });

        position1 = await getClientPosition(utils.getClient(), el1);
        position2 = await getClientPosition(utils.getClient(), el2);
        position3 = await getClientPosition(utils.getClient(), el3);

        expect(position1).eql({ x: 31, y: -274 });
        expect(position2).eql({ x: 227, y: -93 });
        expect(position3).eql({ x: 31, y: 1206 });

        await utils.setScroll(utils.getClient(), 'window', { top: 600, left: 100 });

        position1 = await getClientPosition(utils.getClient(), el1);
        position2 = await getClientPosition(utils.getClient(), el2);
        position3 = await getClientPosition(utils.getClient(), el3);

        expect(position1).eql({ x: -69, y: -574 });
        expect(position2).eql({ x: 127, y: -393 });
        expect(position3).eql({ x: -69, y: 906 });
    });

    it('getClientDimensions', async () => {
        let node       = null;
        let dimensions = await getClientDimensions(utils.getClient(), 'html');

        expect(dimensions.border).eql({ bottom: 0, left: 0, right: 0, top: 0 });
        expect(dimensions.bottom).eql(dimensions.height);
        expect(dimensions.left).eql(0);
        expect(dimensions.top).eql(0);
        expect(dimensions.right).eql(dimensions.width);
        expect(dimensions.scroll).eql({ left: 0, top: 0 });

        dimensions = await getClientDimensions(utils.getClient(), '#target1');

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

        dimensions = await getClientDimensions(utils.getClient(), '#target2');

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

        await utils.setScroll(utils.getClient(), 'document.querySelector(\'#scrollableDiv\')', { top: 20, left: 10 });

        dimensions = await getClientDimensions(utils.getClient(), '#target2');

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

        dimensions = await getClientDimensions(utils.getClient(), '#scrollableDiv');

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

        node       = await utils.getClient().Runtime.evaluate({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'div\')' });
        dimensions = await getClientDimensions(utils.getClient(), node);

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

        expect(await containsOffset(utils.getClient(), selector, 10, void 0)).eql(true);
        expect(await containsOffset(utils.getClient(), selector, void 0, 10)).eql(true);
        expect(await containsOffset(utils.getClient(), selector, -1, -1)).eql(false);
        expect(await containsOffset(utils.getClient(), selector, 10, 10)).eql(true);
        expect(await containsOffset(utils.getClient(), selector, 200, 200)).eql(true);
        expect(await containsOffset(utils.getClient(), selector, 220, 220)).eql(false);
    });

    it('getIframeClientCoordinates', async () => {
        expect(await getIframeClientCoordinates(utils.getClient(), 'iframe')).eql({
            bottom: 405,
            left:   305,
            right:  405,
            top:    304,
        });

        const nestedIFrame = await utils.getClient().Runtime.evaluate({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'iframe\')' });

        expect(await getIframeClientCoordinates(utils.getClient(), nestedIFrame)).eql({
            bottom: 178,
            left:   10,
            right:  310,
            top:    28,
        });
    });

    it('getIframePointRelativeToParentFrame', async () => {
        const point1 = await getIframePointRelativeToParentFrame(utils.getClient(), { x: 42, y: 17 }, ExecutionContext.top.children[0]);
        const point2 = await getIframePointRelativeToParentFrame(utils.getClient(), { x: 1, y: 1 }, ExecutionContext.top.children[0].children[0]);

        await utils.setScroll(utils.getClient(), 'window', { left: 100, top: 50 });
        await utils.setScroll(utils.getClient(), 'document.querySelector(\'iframe\').contentDocument.scrollingElement', { left: 50, top: 10 });

        const point3 = await getIframePointRelativeToParentFrame(utils.getClient(), { x: 42, y: 17 }, ExecutionContext.top.children[0]);
        const point4 = await getIframePointRelativeToParentFrame(utils.getClient(), { x: 1, y: 1 }, ExecutionContext.top.children[0].children[0]);

        expect(point1).eql({ x: 347, y: 321 });
        expect(point2).eql({ x: 11, y: 29 });
        expect(point3).eql({ x: 247, y: 271 });
        expect(point4).eql({ x: -39, y: 19 });
    });

    it('getOffsetPosition', async () => {
        let offsetPosition = await getOffsetPosition(utils.getClient(), '#target2');

        expect(offsetPosition).eql({ left: 227, top: 207 });

        await utils.setScroll(utils.getClient(), 'document.querySelector(\'#scrollableDiv\')', { top: 1000, left: 1000 });

        offsetPosition = await getOffsetPosition(utils.getClient(), '#target2');

        expect(offsetPosition).eql({ left: 133, top: 99 });

        await utils.setScroll(utils.getClient(), 'window', { top: 100, left: 50 });

        offsetPosition = await getOffsetPosition(utils.getClient(), '#target2');

        expect(offsetPosition).eql({ left: 133, top: 99 });

        const node = await utils.getClient().Runtime.evaluate({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'div\')' });

        offsetPosition = await getOffsetPosition(utils.getClient(), node);

        expect(offsetPosition).eql({ left: 8, top: 8 });

        await utils.setScroll(utils.getClient(), 'document.querySelector(\'iframe\').contentDocument.scrollingElement', { left: 50, top: 10 });

        offsetPosition = await getOffsetPosition(utils.getClient(), node);

        expect(offsetPosition).eql({ left: 8, top: 8 });
    });
});
