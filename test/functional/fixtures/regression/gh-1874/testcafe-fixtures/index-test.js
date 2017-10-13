fixture `GH-1874`
    .page `http://localhost:3000/fixtures/regression/gh-1874/pages/index.html`;

test('gh-1874', async t => {
    await t.click('h1');

    var foo = t.eval(() => window.foo);

    await t.expect(foo).eql(42);
});
