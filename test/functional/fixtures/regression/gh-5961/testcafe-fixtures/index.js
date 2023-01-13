import { ClientFunction } from 'testcafe';
import { parseUserAgent } from '../../../../../../lib/utils/parse-user-agent.js';

fixture`Getting Started`
    .page`http://localhost:3000/fixtures/regression/gh-5961/pages/index.html`;

test('Take a resized full page screenshot', async t => {
    const ua = await ClientFunction(() => navigator.userAgent.toString())();

    await t.resizeWindow(1024, 768);
    await t.takeScreenshot({
        path:     'custom/' + parseUserAgent(ua).name + '.png',
        fullPage: true,
    });
});
