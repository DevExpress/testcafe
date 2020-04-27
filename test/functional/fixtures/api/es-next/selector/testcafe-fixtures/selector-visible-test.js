import { Selector } from 'testcafe';

fixture `Selector.visible`
    .page('../pages/visible.html');

test('test', async t => {
    const nonExistingElement = Selector('#wrong-selector');

    await t
        .expect(nonExistingElement.exists).notOk()
        .expect(nonExistingElement.visible).notOk();

    const invisibleElement = Selector('#invisible');

    await t
        .expect(invisibleElement.exists).ok()
        .expect(invisibleElement.visible).notOk();

    const visibleElement = Selector('#invisible, #visible').filterVisible();

    await t.expect(visibleElement.exists).ok();
    await t.expect((await visibleElement()).visible).ok();
    await t.expect(visibleElement.visible).ok();
});

