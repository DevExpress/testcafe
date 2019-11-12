import { Selector } from 'testcafe';

fixture `fixture`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/switching-to-parent/index.html');

test('test', async t => {
    await t
        .click('#openWindowBtn')
        .click('#closeWindowBtn')
        .typeText('input', 'Text')
        .expect(Selector('input').value).eql('text');
});
