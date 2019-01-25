fixture `Video`
    .page `../pages/index.html`;

test('First', async t => {
    await t.wait(2000);
});

test('Second', async t => {
    await t.wait(2000);

    throw new Error('Error 1');
});

test('Third', async t => {
    await t.wait(2000);

    throw new Error('Error 2');
});
