fixture `worker`
    .page `http://localhost:3000/fixtures/regression/gh-7675/pages/index.html`;

test('`importScripts` in worker should not fail in native automation', async () => {
});
