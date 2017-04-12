fixture `gh-1140`
    .page('http://localhost:3000/fixtures/regression/gh-1140/pages/index.html');

test('Perform an action after iframe reloaded', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#target')
        .switchToMainWindow()
        .click('#target');
});
