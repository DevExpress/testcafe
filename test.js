import { Selector } from 'testcafe';

fixture `1`.page`./test.html`;

test(`1`, async t => {
    await t
        .hover(Selector('.item').nth(0))
        .hover(Selector('.item').nth(1))
        .expect(Selector('#header').textContent).eql('item 0 mouseenter item 0 mouseleave item 1 mouseenter item 1 mouseleave');
});
