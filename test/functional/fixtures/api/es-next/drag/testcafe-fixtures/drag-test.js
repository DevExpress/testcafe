// NOTE: to preserve callsites, add new tests AFTER the existing ones

fixture `Drag`
    .page `http://localhost:3000/api/es-next/drag/pages/index.html`;

test('Drag to offset', async t => {
    await t.drag('#draggable-div-1', 10, 20, {
        'offsetX': 10,
        'offsetY': 10
    });
});

test('Drag to offset with incorrect selector', async t => {
    await t.drag({}, 10, 20);
});

test('Drag to offset with incorrect dragOffsetX', async t => {
    await t.drag('#draggable-div-1', NaN, 20);
});

test('Drag to offset with incorrect dragOffsetY', async t => {
    await t.drag('#draggable-div-1', 10, 3.14);
});

test('Drag to offset with incorrect action option', async t => {
    await t.drag('#draggable-div-1', 10, 20, { offsetX: 'test' });
});

test('Drag to element', async t => {
    await t.dragToElement('#draggable-div-2', '#destination-div', {
        'offsetX': 10,
        'offsetY': 10
    });
});

test('Drag to element with incorrect selector', async t => {
    await t.dragToElement(void 0, '#destination-div');
});

test('Drag to element with incorrect destinationSelector', async t => {
    await t.dragToElement('#draggable-div-2', null);
});

test('Drag to element with incorrect action option', async t => {
    await t.dragToElement('#draggable-div-2', '#destination-div', {
        modifiers: { shift: NaN }
    });
});
