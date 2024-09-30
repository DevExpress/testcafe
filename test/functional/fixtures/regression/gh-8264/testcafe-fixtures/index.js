
fixture('GH-8264 - Callsite Issue')
    .page`http://localhost:3000/fixtures/regression/gh-8264/pages/index.html`;

test('Callsite Issue', async t => {
    await t
        .click('#link')
        .click('#btn');
});
