import { ClientFunction } from 'testcafe';
import parseUserAgent from '../../../../../../../lib/utils/parse-user-agent';

const getUserAgent = ClientFunction(() => navigator.userAgent.toString());

fixture `Take a full-page screenshot`
    .page `../pages/full-page.html`;

test('API', async t => {
    const ua = await getUserAgent();

    await t.takeScreenshot({ path: 'custom/' + parseUserAgent(ua).name + '.png', fullPage: true });
});

test('Runner', async t => {
    const ua = await getUserAgent();

    await t.takeScreenshot({ path: 'custom/' + parseUserAgent(ua).name + '.png', fullPage: true });
});

test('Screenshot on fail', async () => {
    const ua = await getUserAgent();

    throw new Error('screenshot on fail' + parseUserAgent(ua).name);
});

