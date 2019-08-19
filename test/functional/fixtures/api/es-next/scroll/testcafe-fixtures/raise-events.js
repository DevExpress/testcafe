import { Selector } from 'testcafe';

fixture `Fixture`
    .page('http://localhost:3000/fixtures/api/es-next/scroll/pages/index.html');

test('Test', async t => {
    const itemSelector = Selector('.item');

    await t
        .hover(itemSelector)
        .click(itemSelector.nth(1))
        .hover(itemSelector.nth(2));

    const { log } = await t.getBrowserConsoleMessages();

    await t.expect(log).eql([
        'd1 mouseover',
        'd1 mouseenter',
        'd1 mouseout',
        'd1 mouseleave',
        'd2 mouseover',
        'd2 mouseenter',
        'd2 click',
        'd2 mouseout',
        'd2 mouseleave',
        'd3 mouseover',
        'd3 mouseenter'
    ]);
});
