fixture `getBrowserConsoleMessages`;


function isNotValidAlias (alias) {
    return alias.indexOf('chromium') === -1 &&
           alias.indexOf('chrome') === -1 &&
           alias.indexOf('chrome-canary') === -1 &&
           alias.indexOf('ie') === -1 &&
           alias.indexOf('edge') === -1 &&
           alias.indexOf('firefox') === -1 &&
           alias.indexOf('opera') === -1 &&
           alias.indexOf('safari') === -1;
}

test
    .page `http://localhost:3000/fixtures/api/es-next/browser-info/pages/index.html`
('t.getBrowserInfo', async t => {
    const browserInfo = await t.getBrowserInfo();

    // [WIP] remove it
    console.log(browserInfo); // eslint-disable-line no-console

    if (isNotValidAlias(browserInfo.alias))
        await t.expect(false).ok();
    else
        await t.expect(true).ok();
});
