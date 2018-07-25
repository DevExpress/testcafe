fixture `Network monitoring`
    .page `http://localhost:3000/fixtures/ping/pages/index.html`;

test('test', async t => {
    console.log(await t.eval(() => new Promise(r => window.resolver = r)));
});
