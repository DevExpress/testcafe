fixture `gh-1161`
    .page `http://localhost:3000/fixtures/regression/gh-1161/pages/index.html`;

test('hover above floating element', async t => {
    await t
        .hover('#data4')
        .hover('#data3')
        .hover('#data2')
        .hover('#data1');
});
