fixture `f`
    .page `http://example.com`;

test(`test`, async t => {
    await t.click('h1');
});
