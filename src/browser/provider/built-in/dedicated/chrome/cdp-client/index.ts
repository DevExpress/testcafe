import { Dictionary } from '../../../../../../configuration/interfaces';
import Protocol from 'devtools-protocol';
import path from 'path';
import os from 'os';
import remoteChrome, { TargetInfo } from 'chrome-remote-interface';
import debug from 'debug';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../../../utils/client-functions';
import WARNING_MESSAGE from '../../../../../../notifications/warning-message';

import {
    Config,
    RuntimeInfo,
    TouchConfigOptions,
    Size,
} from '../interfaces';
import prettyTime from 'pretty-hrtime';
import { CheckedCDPMethod, ELAPSED_TIME_UPPERBOUNDS } from '../elapsed-upperbounds';
import guardTimeExecution from '../../../../../../utils/guard-time-execution';
import delay from '../../../../../../utils/delay';

import StartScreencastRequest = Protocol.Page.StartScreencastRequest;
import ScreencastFrameEvent = Protocol.Page.ScreencastFrameEvent;
import { NativeAutomationInitOptions } from '../../../../../../shared/types';

import {
    NativeAutomationBase,
    NativeAutomationChildWindow,
    NativeAutomationMainWindow,
} from '../../../../../../native-automation';

import {
    getActiveTab,
    getFirstTab,
    getTabById,
    getTabs,
}
    from './utils';

const DEBUG_SCOPE = (id: string): string => `testcafe:browser:provider:built-in:chrome:browser-client:${id}`;
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');

const debugLog = debug('testcafe:browser:provider:built-in:dedicated:chrome');

class ProtocolApiInfo {
    public inactive: boolean;
    public client: remoteChrome.ProtocolApi;

    public constructor (client: remoteChrome.ProtocolApi) {
        this.client   = client;
        this.inactive = false;
    }
}

const SCREENCAST_OPTIONS = {
    format:        'jpeg',
    everyNthFrame: 1,
};

interface VideoFrameData {
    data: string;
    sessionId: number;
}

export const NEW_WINDOW_OPENED_IN_NATIVE_AUTOMATION = 'new-window-opened-in-native-automation';

export class BrowserClient {
    private _clients: Dictionary<ProtocolApiInfo> = {};
    private readonly _runtimeInfo: RuntimeInfo;
    private _parentTarget?: remoteChrome.TargetInfo;
    private readonly debugLogger: debug.Debugger;
    private _videoFramesBuffer: VideoFrameData[];
    private _lastFrame: VideoFrameData | null;
    private _screencastFrameListenerAttached = false;

    public constructor (runtimeInfo: RuntimeInfo) {
        this._runtimeInfo = runtimeInfo;
        this.debugLogger  = debug(DEBUG_SCOPE(runtimeInfo.browserId));

        runtimeInfo.browserClient = this;

        this._videoFramesBuffer = [];
        this._lastFrame         = null;
    }

    private get _port (): number {
        return this._runtimeInfo.cdpPort;
    }

    private get _clientKey (): string {
        return this._runtimeInfo.activeWindowId || this._runtimeInfo.browserId;
    }

    private get _config (): Config {
        return this._runtimeInfo.config;
    }

    private _checkDropOfPerformance (method: CheckedCDPMethod, elapsedTime: [number, number]): void {
        this.debugLogger(`CDP method '${method}' took ${prettyTime(elapsedTime)}`);

        const [ elapsedSeconds ] = elapsedTime;

        if (elapsedSeconds > ELAPSED_TIME_UPPERBOUNDS[method]) {
            this._runtimeInfo.providerMethods.reportWarning(
                WARNING_MESSAGE.browserProviderDropOfPerformance,
                this._runtimeInfo.browserName
            );
        }
    }

    private async _createClient (target: TargetInfo, cacheKey: string = this._clientKey): Promise<remoteChrome.ProtocolApi> {
        const client = await remoteChrome({ target, port: this._port });

        const { Page, Network, Runtime } = client;

        this._clients[cacheKey] = new ProtocolApiInfo(client);

        await guardTimeExecution(
            async () => await Page.enable(),
            elapsedTime => this._checkDropOfPerformance(CheckedCDPMethod.PageEnable, elapsedTime)
        );

        await Network.enable({});
        await Runtime.enable();

        return client;
    }

    private async _setupClient (client: remoteChrome.ProtocolApi): Promise<void> {
        if (this._config.emulation)
            await this._setEmulation(client);

        if (this._config.headless)
            await this._setupDownloads(client);
    }

    private async _setDeviceMetricsOverride (client: remoteChrome.ProtocolApi, width: number, height: number, deviceScaleFactor: number, mobile: boolean): Promise<void> {
        await guardTimeExecution(
            async () => {
                await client.Emulation.setDeviceMetricsOverride({
                    width,
                    height,
                    deviceScaleFactor,
                    mobile,
                    // @ts-ignore
                    fitWindow: false,
                });
            },
            elapsedTime => this._checkDropOfPerformance(CheckedCDPMethod.SetDeviceMetricsOverride, elapsedTime)
        );
    }

    private async _setUserAgentEmulation (client: remoteChrome.ProtocolApi): Promise<void> {
        if (this._config.userAgent === void 0)
            return;

        await client.Network.setUserAgentOverride({ userAgent: this._config.userAgent });
    }

    private async _setTouchEmulation (client: remoteChrome.ProtocolApi): Promise<void> {
        if (this._config.touch === void 0)
            return;

        const touchConfig: TouchConfigOptions = {
            enabled:        this._config.touch,
            configuration:  this._config.mobile ? 'mobile' : 'desktop',
            maxTouchPoints: 1,
        };

        if (client.Emulation.setEmitTouchEventsForMouse)
            await client.Emulation.setEmitTouchEventsForMouse(touchConfig);

        if (client.Emulation.setTouchEmulationEnabled)
            await client.Emulation.setTouchEmulationEnabled(touchConfig);
    }

    private async _setEmulation (client: remoteChrome.ProtocolApi): Promise<void> {
        await this._setUserAgentEmulation(client);
        await this._setTouchEmulation(client);

        await this.resizeWindow({
            width:  this._config.width,
            height: this._config.height,
        });
    }

    private async _setupDownloads (client: remoteChrome.ProtocolApi): Promise<void> {
        await client.Page.setDownloadBehavior({
            behavior:     'allow',
            downloadPath: DOWNLOADS_DIR,
        });
    }

    private async _evaluateRuntime (client: remoteChrome.ProtocolApi, expression: string, returnByValue = false): Promise<Protocol.Runtime.EvaluateResponse> {
        return client.Runtime.evaluate({ expression, returnByValue });
    }

    private async _calculateEmulatedDevicePixelRatio (client: remoteChrome.ProtocolApi): Promise<void> {
        if (!client)
            return;

        const devicePixelRatioQueryResult = await client.Runtime.evaluate({ expression: 'window.devicePixelRatio' });

        this._runtimeInfo.originalDevicePixelRatio = devicePixelRatioQueryResult.result.value;
        this._runtimeInfo.emulatedDevicePixelRatio = this._config.scaleFactor || this._runtimeInfo.originalDevicePixelRatio;
    }

    public async resizeWindow (newDimensions: Size): Promise<void> {
        const { browserId, config, viewportSize, providerMethods, emulatedDevicePixelRatio } = this._runtimeInfo;

        const currentWidth  = viewportSize.width;
        const currentHeight = viewportSize.height;
        const newWidth      = newDimensions.width || currentWidth;
        const newHeight     = newDimensions.height || currentHeight;

        if (!config.headless)
            await providerMethods.resizeLocalBrowserWindow(browserId, newWidth, newHeight, currentWidth, currentHeight);

        viewportSize.width  = newWidth;
        viewportSize.height = newHeight;

        const client = await this.getActiveClient();

        if (client && config.emulation) {
            await this._setDeviceMetricsOverride(client, viewportSize.width, viewportSize.height, emulatedDevicePixelRatio, config.mobile);

            await guardTimeExecution(
                async () => {
                    await client.Emulation.setVisibleSize({ width: viewportSize.width, height: viewportSize.height });
                },
                elapsedTime => this._checkDropOfPerformance(CheckedCDPMethod.SetVisibleSize, elapsedTime)
            );
        }
    }

    public async maximizeWindowNativeAutomation (): Promise<void> {
        const target = await getFirstTab(this._port);
        const client = await this.getActiveClient();

        if (client) {
            const windowParams = await client.Browser.getWindowForTarget({ targetId: target.id });

            await client.Browser.setWindowBounds({ windowId: windowParams.windowId, bounds: { windowState: 'maximized' } });
        }
    }

    public async resizeBounds (newDimensions: Size): Promise<void> {
        const { viewportSize, config } = this._runtimeInfo;

        let nonClientWidth  = 0;
        let nonClientHeight = 0;

        if (viewportSize.outerWidth && viewportSize.outerHeight) {
            nonClientWidth  = viewportSize.outerWidth - viewportSize.width;
            nonClientHeight = viewportSize.outerHeight - viewportSize.height;
        }

        const target = await getFirstTab(this._port);
        const client = await this.getActiveClient();

        if (client) {
            await this._setDeviceMetricsOverride(client, newDimensions.width, newDimensions.height, 1, config.mobile);

            const windowParams = await client.Browser.getWindowForTarget({ targetId: target.id });

            if (windowParams.bounds.windowState !== 'normal') {
                await client.Browser.setWindowBounds({
                    windowId: windowParams.windowId,
                    bounds:   {
                        windowState: 'normal',
                    },
                });
            }

            await client.Browser.setWindowBounds({
                windowId: windowParams.windowId,
                bounds:   {
                    width:  newDimensions.width + nonClientWidth,
                    height: newDimensions.height + nonClientHeight,
                },
            });
        }
    }

    public isHeadlessTab (): boolean {
        return !!this._parentTarget && this._config.headless;
    }

    public async setClientInactive (windowId: string): Promise<void> {
        const client = this._clients[windowId];

        if (client)
            client.inactive = true;
    }

    public async getActiveClient (): Promise<remoteChrome.ProtocolApi | void> {
        try {
            if (!this._clients[this._clientKey]) {
                const target = await getActiveTab(this._port, this._runtimeInfo.activeWindowId);

                await this._createClient(target);
            }
        }
        catch (err) {
            debugLog(err);

            return void 0;
        }

        const info = this._clients[this._clientKey];

        if (info.inactive)
            return void 0;

        return info.client;
    }

    public async initMainWindowCdpClient (): Promise<void> {
        try {
            const tabs = await getTabs(this._port);

            this._parentTarget = tabs.find(t => t.url.includes(this._runtimeInfo.browserId));

            if (!this._parentTarget)
                return;

            const client = await this.getActiveClient();

            if (client) {
                await this._calculateEmulatedDevicePixelRatio(client);
                await this._setupClient(client);
            }
        }
        catch (e) {
            return;
        }
    }

    public async getScreenshotData (fullPage?: boolean): Promise<Buffer> {
        let clip: Protocol.Page.Viewport | undefined = void 0;

        const client = await this.getActiveClient();

        if (!client) {
            // NOTE: required for https://github.com/DevExpress/testcafe/issues/6037
            await delay(0);

            return Buffer.alloc(0);
        }

        if (fullPage) {
            const metrics           = await client.Page.getLayoutMetrics();
            const { width, height } = metrics.cssContentSize || metrics.contentSize;

            clip = { x: 0, y: 0, width, height, scale: 1 };
        }

        const result = await client.Page.captureScreenshot({
            clip,
            captureBeyondViewport: fullPage,
        });

        return Buffer.from(result.data, 'base64');
    }

    public async closeTab (): Promise<void> {
        if (this._parentTarget)
            await remoteChrome.Close({ id: this._parentTarget.id, port: this._port });
    }

    public async updateMobileViewportSize (): Promise<void> {
        const client = await this.getActiveClient();

        if (!client)
            return;

        const windowDimensionsQueryResult = await this._evaluateRuntime(client, `(${GET_WINDOW_DIMENSIONS_INFO_SCRIPT})()`, true);

        const windowDimensions = windowDimensionsQueryResult.result.value;

        this._runtimeInfo.viewportSize.width  = windowDimensions.outerWidth;
        this._runtimeInfo.viewportSize.height = windowDimensions.outerHeight;
    }

    public async closeBrowserChildWindow (windowId: string): Promise<void> {
        await this.setClientInactive(windowId);

        // NOTE: delay browser window closing
        await delay(100);
    }

    public async startCapturingVideo (): Promise<void> {
        const client = await this.getActiveClient();

        if (!client)
            return;

        if (!this._screencastFrameListenerAttached) {
            client.Page.on('screencastFrame', (event: ScreencastFrameEvent) => {
                this._videoFramesBuffer.push({
                    data:      event.data,
                    sessionId: event.sessionId,
                });
            });

            this._screencastFrameListenerAttached = true;
        }

        await client.Page.startScreencast(SCREENCAST_OPTIONS as StartScreencastRequest);
    }

    public async stopCapturingVideo (): Promise<void> {
        const client = await this.getActiveClient();

        if (!client)
            return;

        await client.Page.stopScreencast();

        this._lastFrame         = null;
        this._videoFramesBuffer = [];
    }

    public async getVideoFrameData (): Promise<Buffer | null> {
        const firstFrameFromBuffer = this._videoFramesBuffer.shift();
        const currentVideoFrame    = firstFrameFromBuffer || this._lastFrame;

        if (!currentVideoFrame)
            return null;

        if (this._videoFramesBuffer.length === 0)
            this._lastFrame = currentVideoFrame;

        const client = await this.getActiveClient();

        if (!client)
            return null;

        if (firstFrameFromBuffer)
            await client.Page.screencastFrameAck({ sessionId: currentVideoFrame.sessionId });

        return Buffer.from(currentVideoFrame.data, 'base64');
    }

    private async _onTargetCreatedHandler (targetInfo: remoteChrome.TargetInfo, options: NativeAutomationInitOptions): Promise<string | null> {
        const target = await getTabById(this._port, targetInfo.targetId);

        if (!target)
            return null;

        try {
            const client           = await this._createClient(target, targetInfo.targetId);
            const nativeAutomation = new NativeAutomationChildWindow(this._runtimeInfo.browserId, target.id, client, options);

            await nativeAutomation.start();

            return target.id;
        }
        catch (err) {
            debugLog(err);

            return null;
        }
    }

    public async createMainWindowNativeAutomation (options: NativeAutomationInitOptions): Promise<NativeAutomationBase | null> {
        const target = await getFirstTab(this._port);
        const client = await this._createClient(target);

        const nativeAutomation = new NativeAutomationMainWindow(this._runtimeInfo.browserId, target.id, client, options);

        nativeAutomation.on(NEW_WINDOW_OPENED_IN_NATIVE_AUTOMATION, async targetInfo => this._onTargetCreatedHandler(targetInfo, options));

        return nativeAutomation;
    }
}

