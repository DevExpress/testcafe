import { Selector } from 'testcafe';

fixture `Reporter snapshots`
    .page `http://localhost:3000/fixtures/reporter/pages/snapshots.html`;

test('Basic', async t => {
    await t.click('#input');
    await t.click('#obscuredInput');
    await t.dragToElement('#obscuredInput', '#obscuredDiv');
    await t.selectEditableContent('#p1', '#p2');
});

test('Full snapshot', async () => {
    await Selector('#input')();
});
