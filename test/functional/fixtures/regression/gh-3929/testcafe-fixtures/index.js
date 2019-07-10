import { ClientFunction } from 'testcafe';

fixture `Should reconnect with bad network conditions (GH-3929)`
    .page `http://localhost:3000/fixtures/regression/gh-3929/pages/index.html`;

const getClickCount = ClientFunction(() => {
    return window.clickCount;
});

test(`Click action with bad network conditions`, async t => {
    const browserConnection = t.testRun.browserConnection;
    const browser           = browserConnection.provider.plugin.openedBrowsers[browserConnection.id];
    const cdp               = browser.client;

    const networkConditions = {
        offline:            true,
        latency:            10,
        downloadThroughput: 100000,
        uploadThroughput:   100000
    };

    await cdp.Network.emulateNetworkConditions(networkConditions);

    setTimeout(() => {
        networkConditions.offline = false;

        cdp.Network.emulateNetworkConditions(networkConditions);
    }, 5000);

    const expectedClickCount = 10;

    for (let i = 0; i < expectedClickCount; i++)
        await t.click('button');

    const actualClickCount = await getClickCount();

    await t.expect(actualClickCount).eql(expectedClickCount);
});
