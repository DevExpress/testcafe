fixture `Fail in beforeEach`
    .page `http://localhost:3000/fixtures/api/es-next/hooks/pages/index.html`
    .beforeEach(async t => {
        await t
            .click('#beforeEach')
            .click('#failAndReport');
    })
    .afterEach(async t => {
        await t
            .click('#afterEach')
            .click('#failAndReport');
    });

test('Test', async t => {
    await t
        .click('#test')
        .click('#failAndReport');
});
