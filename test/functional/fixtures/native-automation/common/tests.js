import { ClientFunction } from 'testcafe';

const getParsedUrl = ClientFunction(() => {
    const link       = document.getElementById('link');
    const hammerhead = window['%hammerhead%'];
    const urlUtils   = hammerhead.utils.url;
    const url        = hammerhead.nativeMethods.anchorHrefGetter.call(link);

    return urlUtils.parseProxyUrl(url);
});

export function proxyUrlTest ({ disableNativeAutomation = false } = { }) {
    (disableNativeAutomation ? test.disableNativeAutomation : test)
    ('proxy url', async t => {
        const parsedUrl = await getParsedUrl();

        await t.expect(parsedUrl.proxy).eql({ hostname: '127.0.0.1', port: '1335' });
    });
}

export function nativeUrlTest () {
    test('native url', async t => {
        await t.expect(getParsedUrl()).eql(null);
    });
}
