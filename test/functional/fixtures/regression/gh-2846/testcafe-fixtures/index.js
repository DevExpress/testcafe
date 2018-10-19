fixture `GH-1994 - The element that matches the specified selector is not visible`
    .page `http://localhost:3000/fixtures/regression/gh-2546/pages/index.html`;

test(`Debug`, async t => {
    await t.debug();
});
