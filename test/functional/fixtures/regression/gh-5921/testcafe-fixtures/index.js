import { Selector } from 'testcafe';

fixture `GH-5921 - typeText should replace the old value when the old value length fits maxlength`
    .page `http://localhost:3000/fixtures/regression/gh-5921/pages/index.html`;

test(`Replace the old value`, async t => {
    await t
        .typeText('#input', 'cafe', { replace: true })
        .expect(Selector('#input').value).eql('cafe');
});
