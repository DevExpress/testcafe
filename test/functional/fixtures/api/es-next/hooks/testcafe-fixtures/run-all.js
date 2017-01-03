fixture `Run all`
    .page `http://localhost:3000/fixtures/api/es-next/hooks/pages/index.html`
    .beforeEach(async t => {
        await t.click('#beforeEach');
    })
    .afterEach(async t => {
        await t
            .click('#afterEach')
            .click('#failAndReport');
    });

test('Test1', async t => {
    await t.click('#test');
});

test('Test2', async t => {
    await t.click('#test');
});

test('Test3', async t => {
    await t.click('#test');
}).before(async t => {
    await t.click('#testBefore');
}).after(async t => {
    await t
        .click('#testAfter')
        .click('#failAndReport');
});
