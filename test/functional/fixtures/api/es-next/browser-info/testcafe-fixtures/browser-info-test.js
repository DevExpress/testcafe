import { ClientFunction } from 'testcafe';
import { parseUserAgent } from '../../../../../../../lib/utils/parse-user-agent.js';
import config from '../../../../../config.js';
import { getOSInfo } from 'get-os-info';

fixture `Browser information in headless Chrome`;

test.page `http://localhost:3000/fixtures/api/es-next/browser-info/pages/index.html`
('t.browser', async t => {
    const userAgent       = ClientFunction(() => window.navigator.userAgent);
    const osInfo          = await getOSInfo();
    const parsedUserAgent = parseUserAgent(await userAgent(), osInfo);
    const currentBrowser  = config.currentEnvironment.browsers.find(browser => browser.userAgent === 'headlesschrome');
    const expected        = Object.assign({}, parsedUserAgent, {
        alias:    currentBrowser.browserName,
        headless: true,
    });
    const browserInfo     = t.browser;

    await t.expect(browserInfo).eql(expected);
});
