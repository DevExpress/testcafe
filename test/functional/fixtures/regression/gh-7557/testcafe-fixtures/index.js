fixture `Should consider document scroll in CDP clicking`
    .page `http://localhost:3000/fixtures/regression/gh-7557/pages/index.html`;

test('Should consider document scroll in CDP clicking', async t => {
    await t.click('button');

    const isClickedInParent = await t.eval(() => window.clickedInParent);

    await t.expect(isClickedInParent).eql(true);

    await t.switchToIframe('iframe');
    await t.click('button');

    const isClickedInChild = await t.eval(() => window.clickedInChild);

    await t.expect(isClickedInChild).eql(true);

    await t.switchToIframe('iframe');
    await t.click('button');

    const isClickedInNestedChild = await t.eval(() => window.clickedInNestedChild);

    await t.expect(isClickedInNestedChild).eql(true);
});
