import { Selector } from 'testcafe';

fixture `Cookie synchronization`
    .page('http://localhost:3000/fixtures/multiple-windows/pages/cookie-synchronization/cross-domain/index.html');

test('test', async t => {
    await t
        .click('#openLoginPage')
        .click('#setAuthToken')
        .expect(Selector('#sameDomainCookieStatus').textContent).eql('Cookie isn\'t set for the same-domain page.')
        .expect(Selector('#crossDomainCookieStatus').textContent).eql('Cookie set in cross-domain iframe.');
});
