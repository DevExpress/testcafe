import { ClientFunction } from 'testcafe';

const getParsedUrl = ClientFunction(() => {
    const link       = document.getElementById('link');
    const hammerhead = window['%hammerhead%'];
    const urlUtils   = hammerhead.utils.url;
    const url        = hammerhead.nativeMethods.anchorHrefGetter.call(link);

    return urlUtils.parseProxyUrl(url);
});

fixture `Fixture`
    .page('http://localhost:3000/fixtures/proxyless/pages/index.html');

test('Enabled', async t => {
    await t.expect(getParsedUrl()).eql(null);
});

test('Disabled', async t => {
    const parsedUrl = await getParsedUrl();

    await t.expect(parsedUrl.proxy).eql({ hostname: '127.0.0.1', port: '1335' });
});
