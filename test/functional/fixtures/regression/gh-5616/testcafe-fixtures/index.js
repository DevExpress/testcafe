import { Selector } from 'testcafe';

fixture`Click on "select" element`
    .page('http://localhost:3000/fixtures/regression/gh-5616/pages/index.html');

test('Element "select" shouldn\'t be opened', async (t) => {
    await t.click('select');
    await t.expect(Selector('option').filterVisible().count).eql(0);
});
