fixture `Error before reload`
    .page `http://localhost:3000/page-js-errors/es-next/pages/error-before-reload.html`;

test('Click button', async t => {
    await t.click('#button');
});
