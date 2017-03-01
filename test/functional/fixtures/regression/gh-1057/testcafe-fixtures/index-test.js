import { ClientFunction } from 'testcafe';

fixture `gh-1057`
    .page `http://localhost:3000/fixtures/regression/gh-1057/pages/index.html`;

const targetsClicked = ClientFunction(() => window.target1Clicked && window.target2Clicked);

test('gh-1057', async t => {
    // NOTE: scrolling has issues in iOS Simulator https://github.com/DevExpress/testcafe/issues/1237
    await t
        .click('#target2')
        .click('#target1')
        .expect(targetsClicked()).ok();
});
