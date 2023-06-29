fixture `Skipped tests`
    .page `http://localhost:3000/fixtures/reporter/pages/index.html`;
test('Simple test', async t => {
    await t.wait(1);
    await t.report();
});
test.skip('Simple command err test', async t => {
    await t.click('#non-existing-target');
});

test.skip('Complex command test', async () => {
});

test.skip('Complex nested command test', async () => {
});

test.skip('Complex nested command error', async () => {
});

test.skip('Simple assertion', async t => {
    await t.expect(true).eql(true, 'assertion message', { timeout: 100 });
});
