import { Selector } from 'testcafe';

fixture`Fixture`
    .page('../pages/index.html');

test("Parent shouldn't be visible", async t => {
    const svgParent = Selector('#parent');

    await t
        .expect(svgParent.exists).ok()
        .expect(svgParent.visible).notOk();
});

test("Child shouldn't be visible", async t => {
    const svg = Selector('#child');

    await t
        .expect(svg.exists).ok()
        .expect(svg.visible).notOk();
});
