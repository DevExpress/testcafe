fixture `touch emulation fixture`
    .page `http://localhost:3000/fixtures/regression/gh-318/pages/index.html`;

test('Should finish test without halting', async t => {
    await t.click('h1');
});
