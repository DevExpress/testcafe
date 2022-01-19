import { Selector } from 'testcafe';

fixture`Fixture`
    .page('../pages/index.html');

test('Paren shouldn\'t be visible', async t => {
    const svg = Selector('#parent');

    await t
        .expect(svg.exists).ok()
        .expect(svg.visible).notOk();
});

test('Child shouldn\'t be visible', async t => {
    const svg = Selector('#child');

    await t
        .expect(svg.exists).ok()
        .expect(svg.visible).notOk();
});
