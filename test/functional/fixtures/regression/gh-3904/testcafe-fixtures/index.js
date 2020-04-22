fixture `[Regression](GH-3904) - Should correctly switch to iframe loaded from form`
    .page`http://localhost:3000/fixtures/regression/gh-3904/pages/index.html`;

test('Should correctly switch to iframe loaded from form', async t => {
    await t.switchToIframe('iframe');

    await t.click('h1');
});
