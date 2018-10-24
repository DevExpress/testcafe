import { ClientFunction } from 'testcafe';

fixture `gh-1057 - fixed by hidden parent`
    .page `http://localhost:3000/fixtures/regression/gh-1057/pages/hiddenByFixedParent.html`;

const targetsClicked = ClientFunction(() => window.target1Clicked && window.target2Clicked);

test('gh-1057', async t => {
    // NOTE: scrolling has issues in iOS Simulator https://github.com/DevExpress/testcafe/issues/1237
    await t
        .click('#target2')
        .click('#target1')
        .expect(targetsClicked()).ok();
});

test('gh-1057 with custom offsets', async t => {
    // NOTE: scrolling has issues in iOS Simulator https://github.com/DevExpress/testcafe/issues/1237
    await t
        .click('#target2', { offsetX: -1, offsetY: -1 })
        .click('#target1', { offsetX: 1, offsetY: 1 })
        .expect(targetsClicked()).ok();
});
