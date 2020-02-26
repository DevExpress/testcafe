import { Selector } from 'testcafe';

fixture `Close window immediately after opening`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/close-window-immediately-after-opening/index.html');

test('test', async t => {
    await t
        .click('#openPopUp')
        .expect(Selector('#openWndResult').textContent).eql('The window was closed.');
});
