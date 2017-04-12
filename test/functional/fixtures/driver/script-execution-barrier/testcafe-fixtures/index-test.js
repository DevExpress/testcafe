fixture `Script execution barrier`
    .page `http://localhost:3000/fixtures/driver/script-execution-barrier/pages/index.html`;

test('Add scripts on an action', async t => {
    await t.click('#add-scripts');

    const loadedScripts = await t.eval(() => window.loadedScripts);

    await t.expect(loadedScripts).eql(2);
});

test('Add a long loading script on an action', async t => {
    await t.click('#add-long-loading-script');

    const loadedScripts = await t.eval(() => window.loadedScripts);

    await t.expect(loadedScripts).eql(0);
});

test('Add repetitive adding scripts', async t => {
    await t.click('#add-repetitive-adding-scripts');

    const loadedScripts = await t.eval(() => window.loadedScripts);

    await t
        .expect(loadedScripts).within(1, 9);
});
