fixture `Browser information`;


function isNotValidBrowser (name) {
    const loweredName = name.toLowerCase();

    return loweredName.indexOf('chromium') === -1 &&
           loweredName.indexOf('chrome') === -1 &&
           loweredName.indexOf('internet explorer') === -1 &&
           loweredName.indexOf('microsoft edge') === -1 &&
           loweredName.indexOf('firefox') === -1 &&
           loweredName.indexOf('opera') === -1 &&
           loweredName.indexOf('safari') === -1;
}

function isNotValidPlatform (name) {
    const loweredName = name.toLowerCase();

    return loweredName.indexOf('desktop') === -1 &&
           loweredName.indexOf('mobile') === -1 &&
           loweredName.indexOf('tablet') === -1;
}

test
    .page `http://localhost:3000/fixtures/api/es-next/browser-info/pages/index.html`
('t.browser', async t => {
    const browserInfo = t.browser;

    // [WIP] remove it
    console.log(browserInfo); // eslint-disable-line no-console

    if (isNotValidBrowser(browserInfo.name) || isNotValidPlatform(browserInfo.platform))
        await t.expect(false).ok();
    else
        await t.expect(true).ok();
});
