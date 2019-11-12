import { Selector } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/switching-to-child/link.html');

test('test', async t => {
    await t
        .click('a')
        .typeText('input', 'text')
        .expect(Selector('input').value).eql('text');
});
