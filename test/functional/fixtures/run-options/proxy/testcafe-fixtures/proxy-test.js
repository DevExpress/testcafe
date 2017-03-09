fixture `Proxy`
    .page `http://localhost:3000/fixtures/run-options/proxy/pages/index.html`;

test('Without proxy', async t => {
    const pageTitle = await t.eval(() => document.title);

    await t.expect(pageTitle).eql('Example');
});

test('With proxy', async t => {
    const pageTitle = await t.eval(() => document.title);

    await t.expect(pageTitle).eql('(Proxy) Example');
});
