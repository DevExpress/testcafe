fixture `Skipped tests`
    .page `http://localhost:3000/fixtures/reporter/pages/index.html`;
test('Simple test', async t => {
    await t.wait(1);
    await t.report();
});
test.skip('Skipped test 1', async t => {
    await t.click('#non-existing-target');
});

test.skip('Skipped test 2', async () => {
});

test.skip('Skipped test 3', async () => {
});

test.skip('Skipped test 4', async () => {
});
