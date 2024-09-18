import { Selector } from 'testcafe';

fixture('GH-8261- Element with first DOMRect from getClientRects with zero height/width should be visible')
    .page`http://localhost:3000/fixtures/regression/gh-8261/pages/index.html`;

test('Element should be visible', async t => {
    const element = Selector('a');

    await t.expect(element.visible).ok();
});
