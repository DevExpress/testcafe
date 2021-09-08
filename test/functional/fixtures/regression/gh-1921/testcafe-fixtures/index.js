fixture `GH-1921 - Should switch to iframe loaded dynamically with form.submit`
    .page `http://localhost:3000/fixtures/regression/gh-1921/pages/index.html`;

test(`Switch to iframe`, async t => {
    await t.click('input');
    await t.switchToIframe('iframe');
    await t.click('h1');
});
