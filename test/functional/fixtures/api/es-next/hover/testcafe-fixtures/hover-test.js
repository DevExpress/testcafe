// NOTE: to preserve callsites, add new tests AFTER the existing ones

fixture `Hover`
    .page `http://localhost:3000/fixtures/api/es-next/hover/pages/index.html`;

test('Hover over elements', async t => {
    await t
        .hover('#point')
        .hover('#container', { offsetX: 150, offsetY: 50 })
        .hover('#content1')
        .hover('#content1', { offsetY: 55 })
        .hover('#content2')
        .hover('#container', { offsetX: 150, offsetY: 150 })
        .hover('#point');

    const eventsLog   = (await t.eval(() => window.eventLog)).join(',');
    const expectedLog = [
        'mouseover:container:container',
        'mouseenter:container:container',
        'mouseout:container:container',
        'mouseover:content1:content1',
        'mouseover:content1:child1',
        'mouseover:content1:container',
        'mouseenter:child1:child1',
        'mouseenter:content1:content1',
        'mouseout:content1:content1',
        'mouseout:content1:child1',
        'mouseout:content1:container',
        'mouseleave:content1:content1',
        'mouseleave:child1:child1',
        'mouseover:container:container',
        'mouseout:container:container',
        'mouseover:content2:content2',
        'mouseover:content2:child2',
        'mouseover:content2:container',
        'mouseenter:child2:child2',
        'mouseenter:content2:content2',
        'mouseout:content2:content2',
        'mouseout:content2:child2',
        'mouseout:content2:container',
        'mouseleave:content2:content2',
        'mouseleave:child2:child2',
        'mouseover:container:container',
        'mouseout:container:container',
        'mouseleave:container:container'
    ].join(',');

    await t.expect(eventsLog).eql(expectedLog);
});

test('Incorrect action selector', async t => {
    await t.hover(void 0);
});

test('Incorrect action option', async t => {
    await t.hover('#container1', { offsetX: NaN });
});
