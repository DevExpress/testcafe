fixture `Error after reload`
    .page `http://localhost:3000/page-js-errors/es-next/pages/index.html`;

test('Click button', async t => {
    await t.click('#link');
});
