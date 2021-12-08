const { expect } = require('chai');

const {
    isHtmlElement,
    isBodyElement,
} = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/utils/dom-utils');

const utils = require('./utils');

describe('dom utils', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    it('isHtmlElement', async () => {
        expect(isHtmlElement(await utils.getNode('html'))).eql(true);
        expect(isHtmlElement(await utils.getNode('body'))).eql(false);
    });

    it('isBodyElement', async () => {
        expect(await isBodyElement(await utils.getNode('html'))).eql(false);
        expect(await isBodyElement(await utils.getNode('body'))).eql(true);
    });
});


