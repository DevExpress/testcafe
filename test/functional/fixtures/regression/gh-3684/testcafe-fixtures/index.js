import { Selector } from 'testcafe';

fixture `SVG elements do not break searching by text`
    .page `http://localhost:3000/fixtures/regression/gh-3684/pages/index.html`;

test('SVG elements do not break searching by text', async (t) => {
    await t.expect(Selector('*').withExactText('foo').count).eql(1);
});
