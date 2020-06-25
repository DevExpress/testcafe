fixture `Fixture`
    .page('http://localhost:3000/fixtures/run-options/allow-multiple-windows/pages/headless/index.html');

test('test', async t => {
    await t.click('a');
});
