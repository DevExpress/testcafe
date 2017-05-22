import { Selector, ClientFunction } from 'testcafe';

fixture `Drag`
    .page `http://localhost:3000/fixtures/api/es-next/drag/pages/drag-and-drop.html`;

test('drag and drop', async t => {
    var draggable = Selector('#draggable');

    await t
        .expect(draggable.parent(0).parent(0).id).eql('from')
        .dragToElement(draggable, '#to', { speed: 0.1 })
        .expect(draggable.parent(0).id).eql('to');

    const { requiredEvents, raisedEvents } = await t.eval(() => {
        return { requiredEvents: window.requiredEvents, raisedEvents: window.raisedEvents };
    });

    await t.expect(raisedEvents.join(',')).eql(requiredEvents.join(','));
});

test('drag link and image', async t => {
    /* eslint-disable no-undef */
    //const getOuterHtml = ClientFunction(() => getEl().outerHTML);
    /* eslint-enable no-undef */

    const link   = Selector('#link');
    const img    = Selector('#img');
    const target = Selector('#to-display-values');

    // TODO: waiting for 'parseURL' and 'cleanUpHtml' from 'testcafe-hammerhead'
    /*const linkUrl  = await link.getAttribute('href');
    const linkHtml = await getOuterHtml.with({ dependencies: { getEl: link } })();
    const imgSrc   = await link.getAttribute('src');
    const imgHtml  = await getOuterHtml.with({ dependencies: { getEl: img } })();

    const expectedLinkValues = [linkUrl, linkUrl, linkHtml].join(' - ');
    const expectedImgValues  = [imgSrc, imgSrc, imgHtml].join(' - ');*/

    await t
        .dragToElement(link, target)
        //.expect(target.textContent).eql(expectedLinkValues)
        .dragToElement(img, target);
    //.expect(target.textContent).eql(expectedImgValues);
});

test.page `http://localhost:3000/fixtures/api/es-next/drag/pages/invalid-drag-and-drop.html`
('try to drag undraggable', async t => {
    var undraggable = Selector('#undraggable');
    var preventDrag = Selector('#prevent-drag');

    await t
        .dragToElement(undraggable, '#to')
        .expect(undraggable.parent(0).id).eql('from');

    let expectedLog = [];
    let actualLog   = await t.eval(() => window.dragEvents);

    await t.expect(actualLog).eql(expectedLog);

    await t.dragToElement(preventDrag, '#to')
        .expect(preventDrag.parent(0).id).eql('from');

    expectedLog = ['dragstart'];
    actualLog   = await t.eval(() => window.dragEvents);

    await t.expect(actualLog).eql(expectedLog);
});

test.page `http://localhost:3000/fixtures/api/es-next/drag/pages/invalid-drag-and-drop.html`
('try to drop to undroppable', async t => {
    var draggable = Selector('#draggable');

    await t.expect(draggable.parent(0).id).eql('from')
        .dragToElement(draggable, '#invalid-to')
        .expect(draggable.parent(0).id).eql('from')
        .expect(ClientFunction(() => window.dradendRaised)()).eql(true);
});
