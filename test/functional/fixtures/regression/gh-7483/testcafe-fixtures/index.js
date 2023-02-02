import { Selector } from 'testcafe';

fixture `Should click on the element if the element is behind the Status Bar`
    .page('../pages/index.html');

test('Click the button behind the StatusBar', async t => {
    await t.click('button');

    await t.expect(Selector('#logger').innerText).eql('OK');
});
