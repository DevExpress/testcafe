fixture`Skip command is disposed`
    .page('http://localhost:3000/fixtures/page-js-errors/pages/skip-js-errors.html');

test('First test', async t => {
    await t.skipJsErrors(true)
        .click('button');
});

test('Second test', async t => {
    await t.click('button');
});
