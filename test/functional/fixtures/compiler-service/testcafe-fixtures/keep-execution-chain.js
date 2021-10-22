fixture `Fixture`;

test('test', async t => {
    await t
        .typeText('#wrong-selector', 'text')
        .debug();
});
