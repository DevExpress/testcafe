fixture `gh845`
    .page `http://localhost:3000/fixtures/regression/gh-845/pages/index.html`;

test('Click on a download link', async t => {
    await t
        .click('#link');
});

test('Click on a download link in iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#link');
});
