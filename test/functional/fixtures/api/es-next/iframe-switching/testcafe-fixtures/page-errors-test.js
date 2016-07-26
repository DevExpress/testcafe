// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Page errors in iframes`
    .page `http://localhost:3000/fixtures/api/es-next/iframe-switching/pages/errors.html`;


test('Error in a same-domain iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#error-btn');
});

test('Error in a cross-domain iframe', async t => {
    await t
        .switchToIframe('#cross-domain-iframe')
        .click('#error-btn');
});

test('Error in an iframe during executing in the main window', async t => {
    // NOTE: wait for iframe to load first
    await t
        .switchToIframe('#iframe')
        .switchToMainWindow()
        .click('#error-in-iframe-btn');
});

test('Error in the main window during executing in an iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#error-in-main-window-btn');
});

test('Error in an iframe during execution in another iframe', async t => {
    await t
        .switchToIframe('#iframe')
        .click('#error-in-another-iframe-btn');
});
