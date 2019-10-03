fixture `getBrowserConsoleMessages`;


test
    .page `http://localhost:3000/fixtures/api/es-next/browser-info/pages/index.html`
('t.getBrowserInfo', async t => {
    const browserInfo = await t.getBrowserInfo();

    // [WIP] remove it
    console.log(browserInfo); // eslint-disable-line no-console

    if (browserInfo.alias !== 'chrome' && browserInfo.alias !== 'firefox')
        await t.expect(false).ok();
});
