fixture `Browser information`;


// NOTE: the possible values based on our CI functional test configs:
const testedBrowserNames = [
    'firefox',
    'chrome',
    'safari',
    'internet explorer'
];
const testedPlatforms    = [
    'desktop',
    'mobile',
    'tablet'
];
const testedOs           = [
    'windows',
    'macos',
    'ios',
    'linux'
];

function isNotValidValue (value, expectedValues) {
    const loweredValue = value.toLowerCase();

    expectedValues.forEach(function (expectedValue) {
        if (loweredValue === expectedValue)
            return false;

        return true;
    });
}

test
    .page `http://localhost:3000/fixtures/api/es-next/browser-info/pages/index.html`
('t.browser', async t => {
    const browserInfo = t.browser;

    if (isNotValidValue(browserInfo.name, testedBrowserNames) ||
        isNotValidValue(browserInfo.platform, testedPlatforms) ||
        isNotValidValue(browserInfo.os.name, testedOs))
        await t.expect(false).ok();
    else
        await t.expect(true).ok();
});
