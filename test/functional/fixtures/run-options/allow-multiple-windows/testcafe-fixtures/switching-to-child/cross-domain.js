import { Selector } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/switching-to-child/cross-domain.html');

test('test', async t => {
    await t
        .click('a')
        .typeText('#inputOnChildPage', 'text')
        .expect(Selector('#inputOnChildPage').value).eql('text');
});
