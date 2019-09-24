import { ClientFunction } from 'testcafe';
import { parse } from 'useragent';

const getUserAgent = ClientFunction(() => navigator.userAgent.toString());

fixture `Take a full-page screenshot`
    .page `../pages/full-page.html`;

test('API', async t => {
    const ua = await getUserAgent();

    await t.takeScreenshot({ path: 'custom/' + parse(ua).family + '.png', fullPage: true });
});

test('Runner', async t => {
    const ua = await getUserAgent();

    await t.takeScreenshot({ path: 'custom/' + parse(ua).family + '.png', fullPage: true });
});

test('Screenshot on fail', async () => {
    const ua = await getUserAgent();

    throw new Error('screenshot on fail' + parse(ua).family);
});

