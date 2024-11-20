import { Selector } from 'testcafe';

fixture('GH-8250- Click should not be called after dragToElement')
    .page`http://localhost:3000/fixtures/regression/gh-8250/pages/index.html`;

test('Click should not be called', async t => {
    const h1Label    = Selector('h1').withText('Example');
    const radioInput = Selector('#example');

    await t.dragToElement(h1Label, radioInput);
    await t.expect(radioInput.checked).eql(false);
});
