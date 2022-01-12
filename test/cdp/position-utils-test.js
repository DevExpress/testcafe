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
    getElementFromPoint,
    getWindowPosition,
} = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/utils/position-utils');

describe('position utils', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    it('getClientPosition', async () => {
        const el1 = await utils.getNode('#target1');
        const el2 = await utils.getNode('#target2');
        const el3 = await utils.getNode('#target3');

        let position1 = await getClientPosition(el1);
        let position2 = await getClientPosition(el2);
        let position3 = await getClientPosition(el3);

        expect(position1).eql({ x: 31, y: 26 });
        expect(position2).eql({ x: 227, y: 207 });
        expect(position3).eql({ x: 31, y: 1506 });

        await utils.setScroll('window', { top: 300, left: 0 });

        position1 = await getClientPosition(el1);
        position2 = await getClientPosition(el2);
        position3 = await getClientPosition(el3);

        expect(position1).eql({ x: 31, y: -274 });
        expect(position2).eql({ x: 227, y: -93 });
        expect(position3).eql({ x: 31, y: 1206 });

        await utils.setScroll('window', { top: 600, left: 100 });

        position1 = await getClientPosition(el1);
        position2 = await getClientPosition(el2);
        position3 = await getClientPosition(el3);

        expect(position1).eql({ x: -69, y: -574 });
        expect(position2).eql({ x: 127, y: -393 });
        expect(position3).eql({ x: -69, y: 906 });
    });

    it('getClientDimensions', async () => {
        let node       = null;
        let dimensions = await getClientDimensions(await utils.getNode('html'));

        expect(dimensions.border).eql({ bottom: 0, left: 0, right: 0, top: 0 });
        expect(dimensions.bottom).eql(dimensions.height);
        expect(dimensions.left).eql(0);
        expect(dimensions.top).eql(0);
        expect(dimensions.right).eql(dimensions.width);
        expect(dimensions.scroll).eql({ left: 0, top: 0 });

        dimensions = await getClientDimensions(await utils.getNode('#target1'));

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

        dimensions = await getClientDimensions(await utils.getNode('#target2'));

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

        await utils.setScroll('document.querySelector(\'#scrollableDiv\')', { top: 20, left: 10 });

        dimensions = await getClientDimensions(await utils.getNode('#target2'));

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

        dimensions = await getClientDimensions(await utils.getNode('#scrollableDiv'));

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

        node       = await utils.getNode({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'div\')' });
        dimensions = await getClientDimensions(node);

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
        const node = await utils.getNode('#scrollableDiv');

        expect(await containsOffset(node, 10, void 0)).eql(true);
        expect(await containsOffset(node, void 0, 10)).eql(true);
        expect(await containsOffset(node, -1, -1)).eql(false);
        expect(await containsOffset(node, 10, 10)).eql(true);
        expect(await containsOffset(node, 200, 200)).eql(true);
        expect(await containsOffset(node, 220, 220)).eql(false);
    });

    it('getIframeClientCoordinates', async () => {
        expect(await getIframeClientCoordinates(await utils.getNode('iframe'))).eql({
            bottom: 405,
            left:   305,
            right:  405,
            top:    304,
        });

        const nestedIFrame = await utils.getNode({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'iframe\')' });

        expect(await getIframeClientCoordinates(nestedIFrame)).eql({
            bottom: 178,
            left:   10,
            right:  310,
            top:    28,
        });
    });

    it('getIframePointRelativeToParentFrame', async () => {
        const point1 = await getIframePointRelativeToParentFrame({ x: 42, y: 17 }, ExecutionContext.top.children[0]);
        const point2 = await getIframePointRelativeToParentFrame({ x: 1, y: 1 }, ExecutionContext.top.children[0].children[0]);

        await utils.setScroll('window', { left: 100, top: 50 });
        await utils.setScroll('document.querySelector(\'iframe\').contentDocument.scrollingElement', { left: 50, top: 10 });

        const point3 = await getIframePointRelativeToParentFrame({ x: 42, y: 17 }, ExecutionContext.top.children[0]);
        const point4 = await getIframePointRelativeToParentFrame({ x: 1, y: 1 }, ExecutionContext.top.children[0].children[0]);

        expect(point1).eql({ x: 347, y: 321 });
        expect(point2).eql({ x: 11, y: 29 });
        expect(point3).eql({ x: 247, y: 271 });
        expect(point4).eql({ x: -39, y: 19 });
    });

    it('getOffsetPosition', async () => {
        let offsetPosition = await getOffsetPosition(await utils.getNode('#target2'));

        expect(offsetPosition).eql({ left: 227, top: 207 });

        await utils.setScroll('document.querySelector(\'#scrollableDiv\')', { top: 1000, left: 1000 });

        offsetPosition = await getOffsetPosition(await utils.getNode('#target2'));

        expect(offsetPosition).eql({ left: 133, top: 99 });

        await utils.setScroll('window', { top: 100, left: 50 });

        offsetPosition = await getOffsetPosition(await utils.getNode('#target2'));

        expect(offsetPosition).eql({ left: 133, top: 99 });

        const node = await utils.getNode({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'div\')' });

        offsetPosition = await getOffsetPosition(node);

        expect(offsetPosition).eql({ left: 8, top: 8 });

        await utils.setScroll('document.querySelector(\'iframe\').contentDocument.scrollingElement', { left: 50, top: 10 });

        offsetPosition = await getOffsetPosition(node);

        expect(offsetPosition).eql({ left: 8, top: 8 });
    });

    it('getElementFromPoint', async () => {
        expect((await getElementFromPoint({ x: 31, y: 26 })).object.description).eql('div#target1');
        expect((await getElementFromPoint({ x: 64, y: 26 })).object.description).eql('div#target1');
        expect((await getElementFromPoint({ x: 64, y: 69 })).object.description).eql('div#target1');
        expect((await getElementFromPoint({ x: 31, y: 69 })).object.description).eql('div#target1');

        expect((await getElementFromPoint({ x: 30, y: 25 })).object.description).eql('html');
        expect((await getElementFromPoint({ x: 65, y: 25 })).object.description).eql('html');
        expect((await getElementFromPoint({ x: 65, y: 70 })).object.description).eql('html');
        expect((await getElementFromPoint({ x: 30, y: 70 })).object.description).eql('html');

        expect((await getElementFromPoint({ x: 300, y: 299 })).object.description).eql('html');
        expect((await getElementFromPoint({ x: 301, y: 300 })).object.description).eql('iframe');
        expect((await getElementFromPoint({ x: 302, y: 301 })).object.description).eql('iframe');
        expect((await getElementFromPoint({ x: 303, y: 302 })).object.description).eql('iframe');

        expect((await getElementFromPoint({ x: 401, y: 32 })).object.description).eql('h1');
    });

    it('get window position', async () => {
        const { x, y } = await getWindowPosition();

        expect(x).gte(0);
        expect(y).gte(0);
    });
});
