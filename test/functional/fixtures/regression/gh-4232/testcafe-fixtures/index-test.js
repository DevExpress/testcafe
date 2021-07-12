import { Selector } from 'testcafe';

fixture `gh-4232`
    .page `http://localhost:3000/fixtures/regression/gh-4232/pages/index.html`;

test('Click on submit button in an iframe when the click redirecting to a page on a different domain', async t => {
    const iframe = Selector('#same-domain-iframe', { timeout: 10000 });

    await t
        .switchToIframe(iframe)
        .click('input')
        .expect(Selector('h1').innerText).eql('Cross-domain page');
});
