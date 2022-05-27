fixture `Fixture`
    .page('../pages/index.html');

test('test', async t => {
    await t.click('svg');
});
