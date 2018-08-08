fixture `Network monitoring`
    .page `http://localhost:3000/fixtures/ping/pages/test.html`;

test('test', async t => {
    await t.eval(() => location.toString());
});
