import cdp from 'chrome-remote-interface';


fixture `Test`
    .page `../pages/debug-synchronization/parent.html`;

const TARGET_CHILD_WINDOW_TITLE  = 'Multiwindow debug test: child';

async function getChildWindowTarget (port) {
    const targets = await cdp.List({ port });

    return targets.find(({ title }) => title === TARGET_CHILD_WINDOW_TITLE);
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

async function getChildClient (port, target) {
    const childClient = await cdp({ port, target });

    await childClient.Runtime.enable;

    return childClient;
}

async function waitUntilChildWindowOpens (port) {
    let childTarget = await getChildWindowTarget(port);

    while (!childTarget)
        childTarget = await getChildWindowTarget(port);

    return getChildClient(port, childTarget);
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
    const parentClient = browserInfo.client;

    await t.click('#open');

    const childClient = await waitUntilChildWindowOpens(browserPort);

    const debugPromise = t.debug();

    await waitUntilDebuggingStarts(childClient);

    await closeRemoteWindow(childClient);

    await waitUntilChildWindowCloses(browserPort);

    await waitUntilDebuggingStarts(parentClient);

    await resumeRemoteDebugging(parentClient);

    await debugPromise;
});
