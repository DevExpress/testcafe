import { Selector } from 'testcafe';

fixture `Cookie synchronization`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/cookie-synchronization/same-domain/index.html');

test('test', async t => {
    const resultCookie = Selector('#cookie');

    await t
        .click('#openNewWindow')
        .wait(2000)
        .switchToIframe('iframe')
        .expect(resultCookie.textContent).eql('cookie=from-new-window');
});
