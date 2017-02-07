fixture `gh-1057`
    .page `http://localhost:3000/fixtures/regression/gh-1057/pages/index.html`;

test('gh-1057', async t => {
    // NOTE: scrolling has issues in iOS Simulator https://github.com/DevExpress/testcafe/issues/1237
    await t
        .wait(5000)
        .hover('#target2')
        .wait(5000)
        .hover('#target2')
        .click('#target2')
        .hover('#target1')
        .wait(5000)
        .hover('#target1')
        .click('#target1');

    var targetsClicked = await t.eval(() => window.target1Clicked && window.target2Clicked);

    await t.expect(targetsClicked).ok();
});
