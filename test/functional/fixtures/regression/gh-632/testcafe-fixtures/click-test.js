fixture `Click`
    .page `http://localhost:3000/fixtures/regression/gh-632/pages/index.html`;

test('Click on body', async t => {
    await t.click('#span');
});
