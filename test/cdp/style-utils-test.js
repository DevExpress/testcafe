const { expect }       = require('chai');
const ExecutionContext = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/execution-context');

const {
    getBordersWidth,
    getElementPadding,
    getElementScroll,
    getWindowDimensions,
    getDocumentScroll,
} = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/utils/style-utils');

const utils = require('./utils');

describe('style utils', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    const selector = '#target6';

    it('getBordersWidth', async () => {
        const node = await utils.getNode(selector);

        expect(await getBordersWidth(node)).eql({
            top:    1,
            right:  2,
            bottom: 3,
            left:   4,
        });
    });

    it('getElementPadding', async () => {
        const node = await utils.getNode(selector);

        expect(await getElementPadding(node)).eql({
            top:    4,
            right:  3,
            bottom: 2,
            left:   1,
        });
    });

    it('getElementScroll', async () => {
        const node = await utils.getNode(selector);

        expect(await getElementScroll(node)).eql({
            left: 0,
            top:  0,
        });

        await utils.setScroll('document.querySelector(\'#target6\')', { top: 10, left: 20 });

        expect(await getElementScroll(node)).eql({
            left: 20,
            top:  10,
        });
    });

    it('getWindowDimensions', async () => {
        let dimensions = await getWindowDimensions();

        expect(dimensions.right).gt(500);
        expect(dimensions.bottom).gt(500);

        dimensions = await getWindowDimensions(ExecutionContext.top.children[0]);

        expect(dimensions).eql({
            right:  83,
            bottom: 196,
            left:   0,
            top:    0,
        });
    });

    it('getDocumentScroll', async () => {
        let scroll = await getDocumentScroll();

        expect(scroll).eql({ left: 0, top: 0 });

        await utils.setScroll('window', { top: 200, left: 100 });

        scroll = await getDocumentScroll();

        expect(scroll).eql({ left: 100, top: 200 });

        const node = await utils.getNode({ expression: 'document.querySelector(\'iframe\').contentDocument.querySelector(\'div\')' });

        scroll = await getDocumentScroll(node);

        expect(scroll).eql({ left: 0, top: 0 });

        await utils.setScroll('document.querySelector(\'iframe\').contentDocument.scrollingElement', { left: 50, top: 10 });

        scroll = await getDocumentScroll(node);

        expect(scroll).eql({ left: 50, top: 10 });
    });
});


