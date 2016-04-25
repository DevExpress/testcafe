// NOTE: to preserve callsites, add new tests AFTER the existing ones

fixture `Hover`
    .page `http://localhost:3000/api/es-next/hover/pages/index.html`;

test('Hover over containers', async t => {
    await t.hover('#container1');
    await t.hover('#container2');
});

test('Incorrect action selector', async t => {
    await t.hover(void 0);
});

test('Incorrect action option', async t => {
    await t.hover('#container1', { offsetX: NaN });
});
