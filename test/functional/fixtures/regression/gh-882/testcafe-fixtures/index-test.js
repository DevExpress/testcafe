fixture `gh-882`
    .page `http://localhost:3000/fixtures/regression/gh-882/pages/index.html`;

test('gh-882', async t => {
    await t.hover('#target');
});
