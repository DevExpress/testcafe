import { ClientFunction } from 'testcafe';

fixture `'--window-size' arg in Headless mode (GH-3456)`
    .page `http://localhost:3000/fixtures/regression/gh-3456/pages/index.html`;

const getPageDimensions = ClientFunction(() => {
    return { width: window.outerWidth, height: window.outerHeight };
});

test(`'--window-size' arg`, async t => {
    await t.takeScreenshot('custom/' + Date.now() + '.png');

    const dimensions = await getPageDimensions();

    await t.expect(dimensions).eql({ width: 501, height: 602 });
});
