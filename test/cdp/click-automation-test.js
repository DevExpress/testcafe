const { expect }       = require('chai');
const utils            = require('./utils');
const ExecutionContext = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/execution-context');
const ClickAutomation   = require('../../lib/shared/actions/automations/click');

require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/shared-adapter-initializer');

const options = {
    speed: 0.01,
};

describe('ClickAutomation', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    it('basic', async () => {
        const el = await utils.getNode('#target9');
        const cursor = await utils.createCursor();

        const click = new ClickAutomation(el, options, ExecutionContext.current, cursor);

        await click.run();

        const clickLog = await utils.getClient().Runtime.evaluate({
            expression:    'window.clickLog',
            returnByValue: true,
        });

        expect(clickLog.result.value).eql(['mousedown: target9', 'mouseup: target9', 'click: target9']);
    });
});
