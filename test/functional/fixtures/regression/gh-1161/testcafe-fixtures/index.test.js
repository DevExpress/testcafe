fixture `gh-1161`
    .page `../pages/index.html`;

test('hover above floating element', async t => {
    await t
        .hover('#data4')
        .hover('#data3')
        .hover('#data2')
        .hover('#data1');
});
