import { Selector } from 'testcafe';

fixture `GH-1994 - The element that matches the specified selector is not visible`
    .page `http://example.com`;

test(`Recreate invisible element and click`, async t => {
    await t.click(Selector('h11', { timeout: 100000 }));
});
