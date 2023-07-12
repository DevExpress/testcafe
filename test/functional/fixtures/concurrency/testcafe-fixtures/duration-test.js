fixture`Concurrent duration`
    .page`../pages/index.html`;

test('Test 1', async t => {
    await t.wait(2000);
});

test('Test 2', async t => {
    await t.wait(1000);
});
test('Test 3', async t => {
    await t.wait(1000);
}).after(async t => {
    await t.wait(2000);
});
