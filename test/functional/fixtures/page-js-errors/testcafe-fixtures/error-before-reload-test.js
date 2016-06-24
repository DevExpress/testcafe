fixture `Error before reload`
    .page `http://localhost:3000/fixtures/page-js-errors/pages/error-before-reload.html`;

test('Click button', async t => {
    await t.click('#button');
});
