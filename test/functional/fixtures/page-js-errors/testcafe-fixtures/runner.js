fixture`Runner run options`
    .page('http://localhost:3000/fixtures/page-js-errors/pages/skip-js-errors.html');


test('Throw client error', async t => {
    await t.click('button');
});
