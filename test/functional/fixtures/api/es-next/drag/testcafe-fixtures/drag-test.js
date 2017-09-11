// NOTE: to preserve callsites, add new tests AFTER the existing ones

import { Selector } from 'testcafe';

fixture `Drag`
    .page `http://localhost:3000/fixtures/api/es-next/drag/pages/index.html`;

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

test('Destination element selector returns text node', async t => {
    const getDocument = Selector(() => document);

    await t.dragToElement('#draggable-div-2', getDocument);
});

test('Drag to element with destination offsets', async t => {
    const draggable   = Selector('#draggable-div-3');
    const destination = Selector('#destination-div-2');

    const destRect = await destination.boundingClientRect;

    await t
        .dragToElement(draggable, destination, { offsetX: 0, offsetY: 0, destinationOffsetX: 0, destinationOffsetY: 0 })
        .expect(draggable.getBoundingClientRectProperty('left')).eql(destRect.left)
        .expect(draggable.getBoundingClientRectProperty('top')).eql(destRect.top)
        .dragToElement(draggable, destination, {
            offsetX:            0,
            offsetY:            0,
            destinationOffsetX: -1,
            destinationOffsetY: -1
        })
        .expect(draggable.getBoundingClientRectProperty('left')).eql(destRect.left + destRect.width - 1)
        .expect(draggable.getBoundingClientRectProperty('top')).eql(destRect.top + destRect.height - 1);
});
