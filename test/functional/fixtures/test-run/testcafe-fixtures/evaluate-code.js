fixture `Evaluate Code`
    .page `http://localhost:3000/fixtures/test-run/pages/index.html`;

test('Evaluate', async t => {
    await t
        .expect(await t.testRun._evaluate('Selector("input").count')).eql(3)
        .expect(await t.testRun._evaluate('ClientFunction(() => document.getElementsByTagName("input")[0].id)')()).eql('input1')
        .expect(t.testRun._evaluate('Slctr("input").count').err.toString()).contains('Slctr is not defined');
});
