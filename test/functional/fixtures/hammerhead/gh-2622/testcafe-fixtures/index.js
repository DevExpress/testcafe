import { ClientFunction } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/hammerhead/gh-2622/pages/index.html');

const getInjectedHeadScriptsCount        = ClientFunction(() => window['%hammerhead%'].nativeMethods.querySelectorAll.call(document, 'head > script.script-hammerhead-shadow-ui').length);
const getIframeInjectedHeadScriptsCount  = ClientFunction(() => {
    const iframeDocument = window['%hammerhead%'].nativeMethods.querySelector.call(document, 'iframe').contentDocument;

    return window['%hammerhead%'].nativeMethods.querySelectorAll.call(iframeDocument, 'head > script.script-hammerhead-shadow-ui').length;
});

test('Page and iframe documents should not contain injected head scripts', async t => {
    await t
        .expect(getInjectedHeadScriptsCount()).eql(0)
        .expect(getIframeInjectedHeadScriptsCount()).eql(0);
});
