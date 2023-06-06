import { Selector } from 'testcafe';

fixture `GH-7667 - 'ctrl+a' key combination doesn't work in NA mode`
    .page `http://localhost:3000/fixtures/regression/gh-7667/pages/index.html`;

test(`Delete input whole text via 'ctrl+a delete'`, async t => {
    const input = Selector('#input');

    await t
        .click(input)
        .pressKey('ctrl+a delete')
        .expect(input.value).eql('');
});
