import { Selector } from 'testcafe';

fixture`Getting Started`
    .page`http://localhost:3000/fixtures/regression/gh-6949/pages/with-disabled-checkbox.html`;

test('Click disabled checkbox label', async t => {
    const label = Selector('#checkbox-label');
    const checkBox = Selector('#checkbox');

    await t.click(label);
    await t.expect(checkBox.checked).eql(false);
});
