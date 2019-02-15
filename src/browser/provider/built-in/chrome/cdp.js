import remoteChrome from 'chrome-remote-interface';
import { writeFile } from '../../../../utils/promisified-functions';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../utils/client-functions';


async function getActiveTab (cdpPort, browserId) {
    const tabs = await remoteChrome.listTabs({ port: cdpPort });
    const tab  = tabs.filter(t => t.type === 'page' && t.url.indexOf(browserId) > -1)[0];

    return tab;
}

async function setEmulationBounds ({ client, config, viewportSize, emulatedDevicePixelRatio }) {
    await client.Emulation.setDeviceMetricsOverride({
        width:             viewportSize.width,
        height:            viewportSize.height,
        deviceScaleFactor: emulatedDevicePixelRatio,
        mobile:            config.mobile,
        fitWindow:         false
    });

    await client.Emulation.setVisibleSize({ width: viewportSize.width, height: viewportSize.height });
}

async function setEmulation (runtimeInfo) {
    const { client, config } = runtimeInfo;

    if (config.userAgent !== void 0)
        await client.Network.setUserAgentOverride({ userAgent: config.userAgent });

    if (config.touch !== void 0) {
        const touchConfig = {
            enabled:        config.touch,
            configuration:  config.mobile ? 'mobile' : 'desktop',
            maxTouchPoints: 1
        };

        if (client.Emulation.setEmitTouchEventsForMouse)
            await client.Emulation.setEmitTouchEventsForMouse(touchConfig);

        if (client.Emulation.setTouchEmulationEnabled)
            await client.Emulation.setTouchEmulationEnabled(touchConfig);
    }

    await resizeWindow({ width: config.width, height: config.height }, runtimeInfo);
}

async function getScreenshotData (client) {
    const { visualViewport } = await client.Page.getLayoutMetrics();

    const clipRegion = {
        x:      visualViewport.pageX,
        y:      visualViewport.pageY,
        width:  visualViewport.clientWidth,
        height: visualViewport.clientHeight,
        scale:  visualViewport.scale
    };

    return await client.Page.captureScreenshot({ fromSurface: true, clip: clipRegion });
}

export async function createClient (runtimeInfo) {
    const { browserId, config, cdpPort } = runtimeInfo;

    let tab    = null;
    let client = null;

    try {
        tab = await getActiveTab(cdpPort, browserId);

        if (!tab)
            return;

        client = await remoteChrome({ target: tab, port: cdpPort });
    }
    catch (e) {
        return;
    }

    runtimeInfo.tab    = tab;
    runtimeInfo.client = client;

    await client.Page.enable();
    await client.Network.enable();
    await client.Runtime.enable();

    const devicePixelRatioQueryResult = await client.Runtime.evaluate({ expression: 'window.devicePixelRatio' });

    runtimeInfo.originalDevicePixelRatio = devicePixelRatioQueryResult.result.value;
    runtimeInfo.emulatedDevicePixelRatio = config.scaleFactor || runtimeInfo.originalDevicePixelRatio;

    if (config.emulation)
        await setEmulation(runtimeInfo);
}

export function isHeadlessTab ({ tab, config }) {
    return tab && config.headless;
}

export async function closeTab ({ tab, cdpPort }) {
    await remoteChrome.closeTab({ id: tab.id, port: cdpPort });
}

export async function updateMobileViewportSize (runtimeInfo) {
    const windowDimensionsQueryResult = await runtimeInfo.client.Runtime.evaluate({
        expression:    `(${GET_WINDOW_DIMENSIONS_INFO_SCRIPT})()`,
        returnByValue: true
    });

    const windowDimensions = windowDimensionsQueryResult.result.value;

    runtimeInfo.viewportSize.width  = windowDimensions.outerWidth;
    runtimeInfo.viewportSize.height = windowDimensions.outerHeight;
}

export async function getVideoFrameData ({ client }) {
    const frameData = await getScreenshotData(client);

    return Buffer.from(frameData.data, 'base64');
}

export async function takeScreenshot (path, { client }) {
    const screenshotData = await getScreenshotData(client);

    await writeFile(path, screenshotData.data, { encoding: 'base64' });
}

export async function resizeWindow (newDimensions, runtimeInfo) {
    const { browserId, config, viewportSize, providerMethods } = runtimeInfo;

    const currentWidth  = viewportSize.width;
    const currentHeight = viewportSize.height;
    const newWidth      = newDimensions.width || currentWidth;
    const newHeight     = newDimensions.height || currentHeight;

    if (!config.headless)
        await providerMethods.resizeLocalBrowserWindow(browserId, newWidth, newHeight, currentWidth, currentHeight);

    viewportSize.width  = newWidth;
    viewportSize.height = newHeight;

    if (config.emulation)
        await setEmulationBounds(runtimeInfo);
}
