import {Selector} from "testcafe";

fixture`Getting Started`
    .page`../pages/index.html`;

const getBrowserName = (alias) => alias.split(':').join('_');

test('Take a full page screenshot', async t => {
    const path = `gh-5961/${ getBrowserName(t.browser.alias) }_full-page.png`;

    await t.resizeWindow(2024, 768);
    await t.takeScreenshot({
        path,
        fullPage: true
    });
});

test.page('https://advancedinstaller.com/blog/page-1.html')('Take a full page screenshot2', async t => {
    const path = `gh-5961/${ getBrowserName(t.browser.alias) }1_full-page.png`;
    await t
        .resizeWindow(768, 800)
        .click(Selector('#cookies button'))
        .takeScreenshot({ fullPage: true, path });
});
