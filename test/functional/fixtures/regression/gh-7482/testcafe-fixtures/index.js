fixture.meta('dev', 'true')('Fixture');

test.meta('dev', 'true')('Test', async t => {
    await t.expect(true).ok();
});
