fixture `GH-1136`
    .page('http://localhost:3000/fixtures/regression/gh-1136/pages/index.html');

test('Click on element with negative offsets', async t => {
    await t.click('#target', { offsetX: -1, offsetY: -1 });
});
