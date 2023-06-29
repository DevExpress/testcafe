import { ClientFunction } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/iframes/index.html');

const getNativeTitle = ClientFunction(() => {
    var hammerhead = window['%hammerhead%']; // eslint-disable-line no-var

    return hammerhead.nativeMethods.documentTitleGetter.call(document);
});

test('test', async t => {
    const nativeAutomation = t.testRun.opts.nativeAutomation;
    const nativeTitle      = await getNativeTitle();

    if (nativeAutomation)
        await t.expect(nativeTitle).eql('Index page title');
    else
        await t.expect(nativeTitle).notEql('Index page title');

    await t
        .switchToIframe('#withSrc')
        .expect(getNativeTitle()).eql('Iframe page title')
        .switchToMainWindow()
        .switchToIframe('#withoutSrc')
        .expect(getNativeTitle()).eql('');
});
