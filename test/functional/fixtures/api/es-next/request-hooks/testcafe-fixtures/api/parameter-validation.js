fixture `Parameter validation`;

test('test', async t => {
    await t.addRequestHooks('string');
});
