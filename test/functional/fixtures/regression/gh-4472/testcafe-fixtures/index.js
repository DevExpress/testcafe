import { Selector } from 'testcafe';

fixture `GH-4472`
    .page `http://localhost:3000/fixtures/regression/gh-4472/pages/index.html`;

test(`Should not lose the focus on input`, async t => {
    const input = Selector('#targetInput');

    await t.typeText(input, 'text');
    await t.expect(input.value).eql('text');
});
