fixture `Stops and starts 1`
    .page `../pages/index.html`
    .after(() => {
        throw new Error('tests were not stopped');
    });

test('Stops and starts 1', async t => {
    for (let i = 0; i < 100; i++)
        await t.click('h1');
});

