import { Selector } from 'testcafe';

fixture `GH-1842`
    .page `http://localhost:3000/fixtures/regression/gh-1842/pages/index.html`;

test('gh-1842', async t => {
    await t
        .switchToIframe('#reloading-iframe')
        .click('body')
        .click('body');
});

test('Individual timeout', async t => {
    const iframe = Selector('#iframe', { timeout: 10000 });

    await t
        .switchToIframe(iframe)
        .expect(Selector('body').visible).ok('iframe is loaded')
        .switchToMainWindow();
});
