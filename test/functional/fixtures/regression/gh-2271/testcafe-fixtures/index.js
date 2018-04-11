import { Selector } from 'testcafe';

fixture `GH-2271 - Drag events should contain relatedTarget property`
    .page `http://localhost:3000/fixtures/regression/gh-2271/pages/index.html`;

const logger = Selector('#logger');

test('Drag one element to another', async t => {
    await t.setTestSpeed(0.01);
    await t.dragToElement('#dragElement', '#dropTarget');
    await t.expect(logger.textContent).contains('dragenter dropTarget dragElement');
    await t.expect(logger.textContent).contains('dragleave dragElement dropTarget');
});
