fixture `Error after reload`
    .page `http://localhost:3000/fixtures/page-js-errors/pages/index.html`;

test('Click button', async t => {
    await t.click('#link');
});
