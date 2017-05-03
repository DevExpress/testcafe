import remoteChrome from 'chrome-remote-interface';
import { writeFile } from '../../../../utils/promisified-functions';


async function getActiveTab (cdpPort, browserId) {
    var tabs = await remoteChrome.listTabs({ port: cdpPort });
    var tab  = tabs.filter(t => t.type === 'page' && t.url.indexOf(browserId) > -1)[0];

    return tab;
}

async function getWindowId (client, tab) {
    try {
        var { windowId } = await client.Browser.getWindowForTarget({ targetId: tab.id });

        return windowId;
    }
    catch (e) {
        return null;
    }
}

async function setEmulationBounds (client, device, newDimensions) {
    var width  = newDimensions ? newDimensions.width : device.width;
    var height = newDimensions ? newDimensions.height : device.height;

    await client.Emulation.setDeviceMetricsOverride({
        width:             width,
        height:            height,
        deviceScaleFactor: device.scaleFactor,
        mobile:            device.mobile,
        fitWindow:         true
    });

    await client.Emulation.setVisibleSize({ width, height });
}

async function setEmulation (client, device) {
    if (device.userAgent !== void 0)
        await client.Network.setUserAgentOverride({ userAgent: device.userAgent });

    if (device.touch !== void 0) {
        await client.Emulation.setTouchEmulationEnabled({
            enabled:       device.touch,
            configuration: device.mobile ? 'mobile' : 'desktop'
        });
    }

    await setEmulationBounds(client, device);
}

export async function getClientInfo (browserId, { config, cdpPort }) {
    try {
        var tab = await getActiveTab(cdpPort, browserId);

        if (!tab)
            return {};

        var client   = await remoteChrome({ target: tab, port: cdpPort });
        var windowId = await getWindowId(client, tab);

        await client.Page.enable();
        await client.Network.enable();

        if (config.emulation)
            await setEmulation(client, config);

        return { tab, client, windowId };
    }
    catch (e) {
        return {};
    }
}

export function isHeadlessTab ({ tab, config }) {
    return tab && config.headless;
}

export async function closeTab ({ tab, cdpPort }) {
    await remoteChrome.closeTab({ id: tab.id, port: cdpPort });
}

export async function takeScreenshot (path, { client, config }) {
    var screenshot = await client.Page.captureScreenshot({ fromSurface: config.headless });

    await writeFile(path, screenshot.data, { encoding: 'base64' });
}

export async function resizeWindow (newDimensions, currentDimensions, { config, client, windowId }) {
    var newWidth      = newDimensions.width;
    var newHeight     = newDimensions.height;
    var currentWidth  = currentDimensions.width;
    var currentHeight = currentDimensions.height;

    if (config.emulation || !windowId && config.headless) {
        await setEmulationBounds(client, config.device, { width: newWidth, height: newHeight });

        return;
    }

    if (!windowId)
        return;

    var bounds = await client.Browser.getWindowBounds({ windowId });

    bounds.width += newWidth - currentWidth;
    bounds.height += newHeight - currentHeight;

    await client.Browser.setWindowBounds({ windowId, bounds });
}
