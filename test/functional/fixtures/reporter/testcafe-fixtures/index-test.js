fixture `Reporter`
    .page `http://localhost:3000/fixtures/reporter/pages/index.html`;


test('Simple test', async t => {
    await t.wait(1);
});

test('Simple command test', async t => {
    await t.click('#target');
});

test('Simple command err test', async t => {
    await t.click('#non-existing-target');
});
