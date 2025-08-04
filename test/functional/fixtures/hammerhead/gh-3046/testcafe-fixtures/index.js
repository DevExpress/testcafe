import { Selector } from 'testcafe';

fixture `Worker`
    .page `http://localhost:3000/fixtures/hammerhead/gh-3046/pages/index.html`;

test('Should not break due to importScripts with module workers', async t => {
    await t.expect(Selector('#out').textContent).eql('');
    await t.debug();
    await t.click(Selector('#btn'));
    await t.debug();
    await t.expect(Selector('#out').textContent).eql('100');
});
