fixture `gh-856`
    .page `http://localhost:3000/fixtures/regression/gh-856/pages/first.html`;

test('gh-856', async t => {
    await t.click('#link');
});

test('gh-856 (iframe)', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#link');
});
