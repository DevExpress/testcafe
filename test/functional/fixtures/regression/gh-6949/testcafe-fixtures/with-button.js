import { Selector } from 'testcafe';

fixture`Getting Started`
    .page`http://localhost:3000/fixtures/regression/gh-6949/pages/with-button.html`;

test('Click button inside checkbox label', async t => {
    const button = Selector('#clickable-element');
    const checkBox = Selector('#checkbox');

    await t.click(button);
    await t.expect(checkBox.checked).eql(false);
});
