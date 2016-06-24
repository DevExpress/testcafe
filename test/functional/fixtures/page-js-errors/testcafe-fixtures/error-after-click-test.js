fixture `Error after click`
    .page `http://localhost:3000/fixtures/page-js-errors/pages/error-after-click.html`;

test('Click button', async t => {
    await t.click('#button');
});
