fixture `Reporter`
    .page `http://localhost:3000/fixtures/reporter/pages/index.html`;


test('Simple test', async t => {
    await t.wait(1);
});
