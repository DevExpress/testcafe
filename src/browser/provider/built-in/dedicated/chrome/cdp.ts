import path from 'path';
import os from 'os';
import remoteChrome from 'chrome-remote-interface';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../../utils/client-functions';

interface Size {
    width: number;
    height: number;
}

interface Config {
    deviceName?: string;
    headless: boolean;
    mobile: boolean;
    emulation: false;
    userAgent?: string;
    touch?: boolean;
    width: number;
    height: number;
    scaleFactor: number;
}

interface ProviderMethods {
    resizeLocalBrowserWindow (browserId: string, newWidth: number, newHeight: number, currentWidth: number, currentHeight: number): Promise<void>;
}

interface RuntimeInfo {
    browserId: string;
    cdpPort: number;
    client: remoteChrome.ProtocolApi;
    tab: remoteChrome.TargetInfo;
    config: Config;
    viewportSize: Size;
    emulatedDevicePixelRatio: number;
    originalDevicePixelRatio: number;
    providerMethods: ProviderMethods;
}

interface TouchConfigOptions {
    enabled: boolean;
    configuration: 'desktop' | 'mobile';
    maxTouchPoints: number;
}

const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');

async function getActiveTab (cdpPort: number, browserId: string): Promise<remoteChrome.TargetInfo> {
    const tabs = await remoteChrome.listTabs({ port: cdpPort });

    return tabs.filter(t => t.type === 'page' && t.url.includes(browserId))[0];
}

async function setEmulationBounds ({ client, config, viewportSize, emulatedDevicePixelRatio }: RuntimeInfo): Promise<void> {
    await setDeviceMetricsOverride(client, viewportSize.width, viewportSize.height, emulatedDevicePixelRatio, config.mobile);

    await client.Emulation.setVisibleSize({ width: viewportSize.width, height: viewportSize.height });
}

async function setEmulation (runtimeInfo: RuntimeInfo): Promise<void> {
    const { client, config } = runtimeInfo;

    if (config.userAgent !== void 0)
        await client.Network.setUserAgentOverride({ userAgent: config.userAgent });

    if (config.touch !== void 0) {
        const touchConfig: TouchConfigOptions = {
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

async function enableDownloads ({ client }: RuntimeInfo): Promise<void> {
    await client.Page.setDownloadBehavior({
        behavior:     'allow',
        downloadPath: DOWNLOADS_DIR
    });
}

export async function getScreenshotData ({ client, config, emulatedDevicePixelRatio }: RuntimeInfo, fullPage?: boolean): Promise<Buffer> {
    let viewportWidth = 0;
    let viewportHeight = 0;

    if (fullPage) {
        const { contentSize, visualViewport } = await client.Page.getLayoutMetrics();

        await setDeviceMetricsOverride(
            client,
            Math.ceil(contentSize.width),
            Math.ceil(contentSize.height),
            emulatedDevicePixelRatio,
            config.mobile);

        viewportWidth = visualViewport.clientWidth;
        viewportHeight = visualViewport.clientHeight;
    }

    const screenshotData = await client.Page.captureScreenshot({});

    if (fullPage) {
        if (config.emulation) {
            await setDeviceMetricsOverride(
                client,
                config.width || viewportWidth,
                config.height || viewportHeight,
                emulatedDevicePixelRatio,
                config.mobile);
        }
        else
            await client.Emulation.clearDeviceMetricsOverride();
    }

    return Buffer.from(screenshotData.data, 'base64');
}

async function setDeviceMetricsOverride (client: remoteChrome.ProtocolApi, width: number, height: number, deviceScaleFactor: number, mobile: boolean): Promise<void> {
    await client.Emulation.setDeviceMetricsOverride({
        width,
        height,
        deviceScaleFactor,
        mobile,
        // @ts-ignore
        fitWindow: false
    });
}

export async function createClient (runtimeInfo: RuntimeInfo): Promise<void> {
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
    await client.Network.enable({});
    await client.Runtime.enable();

    const devicePixelRatioQueryResult = await client.Runtime.evaluate({ expression: 'window.devicePixelRatio' });

    runtimeInfo.originalDevicePixelRatio = devicePixelRatioQueryResult.result.value;
    runtimeInfo.emulatedDevicePixelRatio = config.scaleFactor || runtimeInfo.originalDevicePixelRatio;

    if (config.emulation)
        await setEmulation(runtimeInfo);

    if (config.headless)
        await enableDownloads(runtimeInfo);
}

export function isHeadlessTab ({ tab, config }: RuntimeInfo): boolean {
    return tab && config.headless;
}

export async function closeTab ({ tab, cdpPort }: RuntimeInfo): Promise<void> {
    await remoteChrome.closeTab({ id: tab.id, port: cdpPort });
}

export async function updateMobileViewportSize (runtimeInfo: RuntimeInfo): Promise<void> {
    const windowDimensionsQueryResult = await runtimeInfo.client.Runtime.evaluate({
        expression:    `(${GET_WINDOW_DIMENSIONS_INFO_SCRIPT})()`,
        returnByValue: true
    });

    const windowDimensions = windowDimensionsQueryResult.result.value;

    runtimeInfo.viewportSize.width  = windowDimensions.outerWidth;
    runtimeInfo.viewportSize.height = windowDimensions.outerHeight;
}

export async function resizeWindow (newDimensions: Size, runtimeInfo: RuntimeInfo): Promise<void> {
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
