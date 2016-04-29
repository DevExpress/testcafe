fixture `Error after click`
    .page `http://localhost:3000/page-js-errors/es-next/pages/error-after-click.html`;

test('Click button', async t => {
    await t.click('#button');
});
