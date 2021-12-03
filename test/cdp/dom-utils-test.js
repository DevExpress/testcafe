const { expect } = require('chai');

const {
    isHtmlElement,
    isBodyElement,
} = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/utils/dom-utils');

const utils = require('./utils');

describe.only('dom utils', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    it('isHtmlElement', async () => {
        expect(await isHtmlElement(utils.getClient(), 'html')).eql(true);
        expect(await isHtmlElement(utils.getClient(), 'body')).eql(false);
    });

    it('isBodyElement', async () => {
        expect(await isBodyElement(utils.getClient(), 'html')).eql(false);
        expect(await isBodyElement(utils.getClient(), 'body')).eql(true);
    });
});


