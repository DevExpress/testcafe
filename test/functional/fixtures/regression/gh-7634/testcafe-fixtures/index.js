import { Selector } from 'testcafe';

fixture `Download a file`
    .page `http://localhost:3000/fixtures/regression/gh-7634/pages/index.html`;


test('Download a file', async t => {
    await t.click(Selector('a'));
});

