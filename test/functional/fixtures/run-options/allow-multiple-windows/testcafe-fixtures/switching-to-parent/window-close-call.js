import { Selector } from 'testcafe';

fixture `fixture`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/switching-to-parent/index.html');

test('test', async t => {
    const indexPageInput = Selector('#indexPageInput');
    const childPageInput = Selector('#childPageInput');

    await t
        .click('#openWindowBtn')
        .typeText(childPageInput, 'text on child page')
        .expect(childPageInput.value).eql('text on child page')
        .click('#closeWindowBtn')
        .typeText(indexPageInput, 'text on index page')
        .expect(indexPageInput.value).eql('text on index page');
});
