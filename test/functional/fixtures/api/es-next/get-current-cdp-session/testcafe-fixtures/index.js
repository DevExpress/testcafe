
fixture `Get current CDP session`
    .page `http://localhost:3000/fixtures/api/es-next/get-current-cdp-session/pages/index.html`;

test(`Get current CDP session`, async t => {
    const mainWindowId = await t.testRun.activeWindowId;

    let clientCDP = await t.getCurrentCDPSession();

    await t.expect(clientCDP.webSocketUrl).contains(mainWindowId);

    await t.click('a').click('h1');

    const childWindowId = await t.testRun.activeWindowId;

    clientCDP = await t.getCurrentCDPSession();

    await t.expect(clientCDP.webSocketUrl).contains(childWindowId);
});
