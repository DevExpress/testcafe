import { Selector, ClientFunction } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/api/es-next/scroll/pages/event-properties.html');

const getElementClassFromPoint = ClientFunction((x, y) => {
    const element = document.elementFromPoint(x, y);

    return element && element.className;
});

test('test', async t => {
    const target = Selector('#target');

    const targetBounds = await target.boundingClientRect;

    // NOTE: All actions should be aligned vertically at the center of the target to prevent MouseMove actions and force the Scroll action to raise mouseenter/mouseleave events
    const offsetX = 0.5 * (targetBounds.left + targetBounds.right);

    await t
        .click('#space-before', { offsetX })
        .hover('#target', { offsetX })
        .click('#space-after', { offsetX })
        .expect(Selector('#emittedEvents').textContent).eql('mouseenter;mouseleave;');

    const emittedEventDetails = await Selector('#emittedEventDetails').textContent;
    const log                 = emittedEventDetails.split('|');

    const mouseenterEventProperties = JSON.parse(log[0]);
    const mouseleaveEventProperties = JSON.parse(log[1]);

    await t
        .expect(mouseenterEventProperties.name).eql('mouseenter')
        .expect(mouseenterEventProperties.ctrl).eql(false)
        .expect(mouseenterEventProperties.alt).eql(false)
        .expect(mouseenterEventProperties.shift).eql(false)
        .expect(mouseenterEventProperties.meta).eql(false)
        .expect(mouseenterEventProperties.relatedTarget).eql('space')
        .expect(mouseenterEventProperties.target).eql('item')
        .expect(getElementClassFromPoint(mouseenterEventProperties.clientX, mouseenterEventProperties.clientY)).eql('space')

        .expect(mouseleaveEventProperties.name).eql('mouseleave')
        .expect(mouseleaveEventProperties.ctrl).eql(false)
        .expect(mouseleaveEventProperties.alt).eql(false)
        .expect(mouseleaveEventProperties.shift).eql(false)
        .expect(mouseleaveEventProperties.meta).eql(false)
        .expect(mouseleaveEventProperties.relatedTarget).eql('space')
        .expect(mouseleaveEventProperties.target).eql('item')
        .expect(getElementClassFromPoint(mouseleaveEventProperties.clientX, mouseenterEventProperties.clientY)).eql('space');
});
