fixture `Unhandled Promise rejection`
    .page `http://localhost:3000/fixtures/page-js-errors/pages/unhandled-promise-rejection-test.html`;

test('Click button', async t => {
    await t.click('#button');
});
