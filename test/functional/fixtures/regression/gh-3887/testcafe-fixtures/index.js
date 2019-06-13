fixture`gh-3887`
    .page`http://localhost:3000/fixtures/regression/gh-3887/pages/index.html`;

test('Check body.childNodes.length after typing in an iframe', async t => {
    await t
        .switchToIframe('iframe')
        .typeText('body', '=SU', { replace: true })
        .typeText('body', '=SU', { replace: true })
        .switchToMainWindow()
        .pressKey('ctrl');

    const count = await t.eval(() => document.querySelector('iframe').contentDocument.body.childNodes.length);

    await t.expect(count).eql(1);
});
