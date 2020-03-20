import { Selector } from 'testcafe';

fixture `Selector.visible`
    .page('http://localhost:3000/fixtures/api/es-next/selector/pages/visible.html');

test('test', async t => {
    const nonExistingElement = Selector('#wrong-selector');

    await t
        .expect(nonExistingElement.exists).notOk()
        .expect(nonExistingElement.visible).notOk();

    const existingElement = Selector('div');

    await t
        .expect(existingElement.exists).ok()
        .expect(existingElement.visible).notOk();
});

