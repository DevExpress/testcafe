fixture `Getting Started`
    .page('http://localhost:9090/index.html');

test('My test', async t => {
    await t
		.setNativeDialogHandler(() => true)
        .click('#clickHere');
});