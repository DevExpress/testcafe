// NOTE: to preserve callsites, add new tests AFTER the existing ones

fixture `Double Click`
    .page `http://localhost:3000/fixtures/api/es-next/double-click/pages/index.html`;

test('Double click on a button', async t => {
    await t.doubleClick('#button');
});

test('Incorrect action selector', async t => {
    await t.doubleClick(null);
});

test('Incorrect action option', async t => {
    await t.doubleClick('#button', { offsetX: 3.14 });
});
