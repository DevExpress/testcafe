import { Selector } from 'testcafe';

fixture `GH-2271 - Drag events should contain relatedTarget property`
    .page `http://localhost:3000/fixtures/regression/gh-2271/pages/index.html`;

const logger = Selector('#logger');

test('Drag one element to another', async t => {
    await t.setTestSpeed(0.05);
    await t.dragToElement('#dragElement', '#dropTarget2');
    await t.expect(logger.textContent).contains('dragenter dragElement body');
    await t.expect(logger.textContent).contains('dragenter dropTarget1 dragElement');
    await t.expect(logger.textContent).contains('dragleave dragElement dropTarget1');
    await t.expect(logger.textContent).contains('dragenter dropTarget2 dropTarget1');
    await t.expect(logger.textContent).contains('dragleave dropTarget1 dropTarget2');
});
