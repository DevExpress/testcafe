import { Selector } from 'testcafe';

fixture `Should click element if it's overlapped by StatusBar`
    .page `http://localhost:3000/fixtures/regression/gh-7797/pages/index.html`;

test('Should click element if it\'s overlapped by StatusBar', async t => {
    await t.switchToIframe('iframe');
    await t.click('button');
    await t.expect(Selector('#logger').innerText).eql('click');
});
