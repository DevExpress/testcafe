import { Selector, ClientFunction } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/api/es-next/scroll/pages/event-properties.html');

const getElementClassFromPoint = ClientFunction((x, y) => {
    const element = document.elementFromPoint(x, y);

    return element && element.className;
});

test('test', async t => {
    await t
        .hover('.item')
        .click(Selector('.space').nth(1))
        .expect(Selector('#emittedEvents').textContent).eql('mouseenter;mouseleave;');

    const { log } = await t.getBrowserConsoleMessages();

    const mouseenterEventProperties = JSON.parse(log[0]);
    const mouseleaveEventProperties = JSON.parse(log[1]);

    await t
        .expect(mouseenterEventProperties.name).eql('mouseenter')
        .expect(mouseenterEventProperties.ctrl).eql(false)
        .expect(mouseenterEventProperties.alt).eql(false)
        .expect(mouseenterEventProperties.shift).eql(false)
        .expect(mouseenterEventProperties.meta).eql(false)
        .expect(mouseenterEventProperties.relatedTarget).eql('html')
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
