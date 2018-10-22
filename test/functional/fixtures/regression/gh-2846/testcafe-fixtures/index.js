fixture `GH-2846`
    .page `http://localhost:3000/fixtures/regression/gh-2846/pages/index.html`;

test(`Debug`, async t => {
    await t.debug();
});
