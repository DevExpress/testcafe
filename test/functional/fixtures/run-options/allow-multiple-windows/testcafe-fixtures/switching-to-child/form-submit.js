import { Selector } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/switching-to-child/form.html');

test('test', async t => {
    await t
        .click('#submitBtn')
        .typeText('#inputOnChildPage', 'text')
        .expect(Selector('#inputOnChildPage').value).eql('text');
});
