fixture `GH-3070 - Should not hang after 'wait' command`
    .page `http://localhost:3000/fixtures/regression/gh-3070/pages/index.html`;

test(`Wait for 15 seconds`, async t => {
    await t.wait(15000);
    await t.click('h1');
});
