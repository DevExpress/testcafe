import cdp from 'chrome-remote-interface';

fixture `Test`
    .page `../pages/debug-synchronization/parent.html`;

const TARGET_CHILD_WINDOW_FILENAME = 'child.html';

async function getChildWindowTarget (port) {
    const targets = await cdp.List({ port });

    return targets.find(({ url }) => url.includes(TARGET_CHILD_WINDOW_FILENAME));
}

async function executeClientFunction (cdpClient, action) {
    const { result: { value } } = await cdpClient.Runtime.evaluate({ expression: `(${action.toString()})()` });

    return value;
}

function closeWindow () {
    window.close();
}

function getDebuggingState () {
    return window['%testCafeDriverInstance%'].statusBar.state.debugging;
}

function resumeDebugging () {
    window['%testCafeDriverInstance%'].statusBar.resumeButton.dispatchEvent(new MouseEvent('mousedown'));
}

async function getRemoteDebuggingState (cdpClient) {
    return executeClientFunction(cdpClient, getDebuggingState);
}

async function waitUntilDebuggingStarts (cdpClient) {
    let debuggingState = await getRemoteDebuggingState(cdpClient);

    while (!debuggingState)
        debuggingState = await getRemoteDebuggingState(cdpClient);
}

async function waitUntilChildWindowCloses (port) {
    let childTarget = await getChildWindowTarget(port);

    while (childTarget)
        childTarget = await getChildWindowTarget(port);
}

async function closeRemoteWindow (cdpClient) {
    await executeClientFunction(cdpClient, closeWindow);
}

async function resumeRemoteDebugging (cdpClient) {
    await executeClientFunction(cdpClient, resumeDebugging);
}

test('test', async t => {
    const browserInfo  = t.testRun.browserConnection.provider.plugin.openedBrowsers[t.testRun.browserConnection.id];
    const browserPort  = browserInfo.cdpPort;
    const parentClient = await browserInfo.browserClient.getActiveClient();

    await t.click('#open');

    await t.click('body');

    const childClient = await browserInfo.browserClient.getActiveClient();

    const debugPromise = t.debug();

    await waitUntilDebuggingStarts(childClient);

    await closeRemoteWindow(childClient);

    await waitUntilChildWindowCloses(browserPort);

    await waitUntilDebuggingStarts(parentClient);

    await resumeRemoteDebugging(parentClient);

    await debugPromise;
});
