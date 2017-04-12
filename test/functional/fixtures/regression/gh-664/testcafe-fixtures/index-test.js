fixture `GH-664`
    .page `http://localhost:3000/fixtures/regression/gh-664/pages/index.html`;

test('Perform cancelled redirect', async t => {
    await t.click('#link');
});
