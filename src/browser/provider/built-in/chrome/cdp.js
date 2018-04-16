import remoteChrome from 'chrome-remote-interface';
import { writeFile } from '../../../../utils/promisified-functions';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../utils/client-functions';


async function getActiveTab (cdpPort, browserId) {
    var tabs = await remoteChrome.listTabs({ port: cdpPort });
    var tab  = tabs.filter(t => t.type === 'page' && t.url.indexOf(browserId) > -1)[0];

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
    var { client, config } = runtimeInfo;

    if (config.userAgent !== void 0)
        await client.Network.setUserAgentOverride({ userAgent: config.userAgent });

    if (config.touch !== void 0) {
        const touchConfig = {
            enabled:       config.touch,
            configuration: config.mobile ? 'mobile' : 'desktop'
        };

        if (client.Emulation.setEmitTouchEventsForMouse)
            await client.Emulation.setEmitTouchEventsForMouse(touchConfig);
        else if (client.Emulation.setTouchEmulationEnabled)
            await client.Emulation.setTouchEmulationEnabled(touchConfig);
    }

    await resizeWindow({ width: config.width, height: config.height }, runtimeInfo);
}

export async function createClient (runtimeInfo) {
    var { browserId, config, cdpPort } = runtimeInfo;

    var tab = await getActiveTab(cdpPort, browserId);

    if (!tab)
        return;

    try {
        var client = await remoteChrome({ target: tab, port: cdpPort });
    }
    catch (e) {
        return;
    }

    runtimeInfo.tab    = tab;
    runtimeInfo.client = client;

    await client.Page.enable();
    await client.Network.enable();
    await client.Runtime.enable();

    var devicePixelRatioQueryResult = await client.Runtime.evaluate({ expression: 'window.devicePixelRatio' });

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

export async function takeScreenshot (path, { client, config }) {
    var screenshot = await client.Page.captureScreenshot({ fromSurface: config.headless });

    await writeFile(path, screenshot.data, { encoding: 'base64' });
}

export async function resizeWindow (newDimensions, runtimeInfo) {
    var { browserId, config, viewportSize, providerMethods } = runtimeInfo;

    var currentWidth  = viewportSize.width;
    var currentHeight = viewportSize.height;
    var newWidth      = newDimensions.width || currentWidth;
    var newHeight     = newDimensions.height || currentHeight;

    if (!config.headless)
        await providerMethods.resizeLocalBrowserWindow(browserId, newWidth, newHeight, currentWidth, currentHeight);

    viewportSize.width  = newWidth;
    viewportSize.height = newHeight;

    if (config.emulation)
        await setEmulationBounds(runtimeInfo);
}
