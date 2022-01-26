const utils                    = require('./utils');
const ExecutionContext         = require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/execution-context');
const VisibleElementAutomation = require('../../lib/shared/actions/automations/visible-element-automation');

require('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client/shared-adapter-initializer');

describe('VisibleElementAutomation', () => {
    before(utils.before);
    after(utils.after);
    beforeEach(utils.beforeEach);

    it('basic', async () => {
        const el     = await utils.getNode('#target1');
        const cursor = await utils.createCursor();

        const visibleAutomation = new VisibleElementAutomation(el, { }, ExecutionContext.current, cursor);

        await visibleAutomation._ensureElement(false, false, true);
    });
});
