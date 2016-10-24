fixture `gh-883`
    .page `http://localhost:3000/fixtures/regression/gh-883/pages/index.html`;

test('gh-883', async t => {
    await t.hover('#target');
});
