fixture `fixture 1`
    .page `http://localhost:3000/fixtures/regression/gh-5207/pages/index.html`;

test(`test 1`, async t => {
    await t.wait(2000);
});

fixture `fixture 2`
    .disablePageReloads
    .page `http://example.com`;

test(`test 2`, async t => {
    await t.wait(2000);

    await t.click('h1');
});
