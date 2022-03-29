import { Selector } from 'testcafe';

fixture`Getting Started`
    .page`http://localhost:3000/fixtures/regression/gh-6949/pages/with-link.html`;

test('Click checkbox label', async t => {
    const label = Selector('#checkbox-label');
    const checkBox = Selector('#checkbox');

    await t.click(label);
    await t.expect(checkBox.checked).eql(true);
});

test('Click link inside checkbox label', async t => {
    const link = Selector('#clickable-element');
    const checkBox = Selector('#checkbox');

    await t.click(link);
    await t.expect(checkBox.checked).eql(false);
});
