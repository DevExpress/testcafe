fixture `GH-1999 - Shouldn't raise an error if an iframe has html in src`
    .page `http://localhost:3000/fixtures/regression/gh-1999/pages/index.html`;

test('Click in iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('body');
});
