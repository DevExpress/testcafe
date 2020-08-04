fixture `Fixture`
    .page('http://localhost:3000/fixtures/multiple-windows/pages/handle-errors/index.html');

test('test', async t => {
    await t
        .click('#openNewPageBtn')
        .click('#raiseJsErrorBtn');
});
