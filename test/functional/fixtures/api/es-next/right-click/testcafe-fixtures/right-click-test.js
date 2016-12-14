// NOTE: to preserve callsites, add new tests AFTER the existing ones

fixture `RightClick`
    .page `http://localhost:3000/fixtures/api/es-next/right-click/pages/index.html`;

test('Right click button', async t => {
    await t.rightClick('#button');
});

test('Incorrect action selector', async t => {
    await t.rightClick(123);
});

test('Incorrect action option', async t => {
    await t.rightClick('#button', { offsetX: -3.5 });
});
