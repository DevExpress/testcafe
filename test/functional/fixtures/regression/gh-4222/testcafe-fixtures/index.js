fixture `My first fixture`
    .page `../pages/index.html`;

test('test', async t => {
    await t.click('button');
});
