// NOTE: to preserve callsites, add new tests AFTER the existing ones

fixture `Click`
    .page `http://localhost:3000/api/es-next/click/pages/index.html`;

test('Incorrect action selector', async t => {
    await t.click(123);
});

test('Incorrect action option', async t => {
    await t.click('#btn', { offsetX: -3 });
});

test('Click button', async t => {
    await t.click('#btn');
});
