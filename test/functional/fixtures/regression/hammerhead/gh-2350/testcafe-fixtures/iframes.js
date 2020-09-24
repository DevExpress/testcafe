import { ClientFunction } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/regression/hammerhead/gh-2350/pages/iframes/index.html');

const getNativeTitle = ClientFunction(() => {
    var hammerhead = window['%hammerhead%']; // eslint-disable-line no-var

    return hammerhead.nativeMethods.documentTitleGetter.call(document);
});

test('test', async t => {
    await t
        .expect(getNativeTitle()).notEql('Index page title')
        .switchToIframe('#withSrc')
        .expect(getNativeTitle()).eql('Iframe page title')
        .switchToMainWindow()
        .switchToIframe('#withoutSrc')
        .expect(getNativeTitle()).eql('');
});
