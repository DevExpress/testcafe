import { Selector } from 'testcafe';

fixture`Getting Started`
    .page`http://localhost:3000/fixtures/regression/gh-6969/pages/index.html`;

test('Should change checkbox checked state when pressing space key', async t => {
    const checkBox = Selector('#checkbox');

    await t.click(checkBox)
        .expect(checkBox.checked).ok()
        .pressKey('space')
        .expect(checkBox.checked).notOk()
        .pressKey('space')
        .expect(checkBox.checked).ok();
});
