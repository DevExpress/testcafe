import { readSync as read } from 'read-file-relative';
import { Dictionary } from '../../../../../../configuration/interfaces';
import Protocol from 'devtools-protocol';
import path from 'path';
import os from 'os';
import remoteChrome from 'chrome-remote-interface';
import debug from 'debug';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../../../utils/client-functions';
import WARNING_MESSAGE from '../../../../../../notifications/warning-message';

import {
    Config,
    RuntimeInfo,
    TouchConfigOptions,
    Size
} from '../interfaces';
import prettyTime from 'pretty-hrtime';
import { CheckedCDPMethod, ELAPSED_TIME_UPPERBOUNDS } from '../elapsed-upperbounds';
import guardTimeExecution from '../../../../../../utils/guard-time-execution';
import {
    ClientFunctionExecutionInterruptionError,
    UncaughtErrorInClientFunctionCode,
    DomNodeClientFunctionResultError
} from '../../../../../../shared/errors';

const DEBUG_SCOPE = (id: string): string => `testcafe:browser:provider:built-in:chrome:browser-client:${id}`;
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');
const EXECUTION_CTX_WAS_DESTROYED_CODE = -32000;

const debugLog = debug('testcafe:browser:provider:built-in:dedicated:chrome');

export class BrowserClient {
    private _clients: Dictionary<remoteChrome.ProtocolApi> = {};
    private _runtimeInfo: RuntimeInfo;
    private readonly _isProxyless: boolean;
    private _parentTarget?: remoteChrome.TargetInfo;
    private readonly debugLogger: debug.Debugger;
    // new Map<frameId, executionContextId>
    private readonly _frameExecutionContexts = new Map<string, number>();
    private _currentFrameId: string = '';

    public constructor (runtimeInfo: RuntimeInfo, isProxyless: boolean) {
        this._runtimeInfo = runtimeInfo;
        this.debugLogger  = debug(DEBUG_SCOPE(runtimeInfo.browserId));
        this._isProxyless = isProxyless;

        runtimeInfo.browserClient = this;
    }

    private get _clientKey (): string {
        return this._runtimeInfo.activeWindowId || this._runtimeInfo.browserId;
    }

    private get _config (): Config {
        return this._runtimeInfo.config;
    }

    private async _getTabs (): Promise<remoteChrome.TargetInfo[]> {
        const tabs = await remoteChrome.List({ port: this._runtimeInfo.cdpPort });

        return tabs.filter(t => t.type === 'page');
    }

    private async _getActiveTab (): Promise<remoteChrome.TargetInfo> {
        let tabs = await this._getTabs();

        if (this._runtimeInfo.activeWindowId)
            tabs = tabs.filter(t => t.title.includes(this._runtimeInfo.activeWindowId));

        return tabs[0];
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

    private async _createClient (): Promise<remoteChrome.ProtocolApi> {
        const target                     = await this._getActiveTab();
        const client                     = await remoteChrome({ target, port: this._runtimeInfo.cdpPort });
        const { Page, Network, Runtime } = client;

        this._clients[this._clientKey] = client;

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
                    fitWindow: false
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
            maxTouchPoints: 1
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
            height: this._config.height
        });
    }

    private async _setupDownloads (client: remoteChrome.ProtocolApi): Promise<void> {
        await client.Page.setDownloadBehavior({
            behavior:     'allow',
            downloadPath: DOWNLOADS_DIR
        });
    }

    private async _evaluateRuntime (client: remoteChrome.ProtocolApi, expression: string, returnByValue: boolean = false): Promise<Protocol.Runtime.EvaluateResponse> {
        return client.Runtime.evaluate({ expression, returnByValue });
    }

    private async _calculateEmulatedDevicePixelRatio (client: remoteChrome.ProtocolApi): Promise<void> {
        if (!client)
            return;

        const devicePixelRatioQueryResult = await client.Runtime.evaluate({ expression: 'window.devicePixelRatio' });

        this._runtimeInfo.originalDevicePixelRatio = devicePixelRatioQueryResult.result.value;
        this._runtimeInfo.emulatedDevicePixelRatio = this._config.scaleFactor || this._runtimeInfo.originalDevicePixelRatio;
    }

    private async _injectProxylessStuff (client: remoteChrome.ProtocolApi): Promise<void> {
        await client.Page.addScriptToEvaluateOnNewDocument({
            source: read('../../../../../../../lib/client/proxyless/index.js') as string
        });
    }

    private _setupFramesWatching (client: remoteChrome.ProtocolApi): void {
        client.Runtime.on('executionContextCreated', (event: Protocol.Runtime.ExecutionContextCreatedEvent) => {
            if (!event.context.auxData?.frameId)
                return;

            this._frameExecutionContexts.set(event.context.auxData.frameId, event.context.id);
        });

        client.Runtime.on('executionContextDestroyed', (event: Protocol.Runtime.ExecutionContextDestroyedEvent) => {
            for (const [frameId, executionContextId] of this._frameExecutionContexts.entries()) {
                if (executionContextId === event.executionContextId)
                    this._frameExecutionContexts.delete(frameId);
            }
        });

        client.Runtime.on('executionContextsCleared', () => {
            this._currentFrameId = '';
            this._frameExecutionContexts.clear();
        });
    }

    public async resizeWindow (newDimensions: Size): Promise<void> {
        const { browserId, config, viewportSize, providerMethods, emulatedDevicePixelRatio } = this._runtimeInfo;

        const currentWidth = viewportSize.width;
        const currentHeight = viewportSize.height;
        const newWidth = newDimensions.width || currentWidth;
        const newHeight = newDimensions.height || currentHeight;

        if (!config.headless)
            await providerMethods.resizeLocalBrowserWindow(browserId, newWidth, newHeight, currentWidth, currentHeight);

        viewportSize.width = newWidth;
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

    public isHeadlessTab (): boolean {
        return !!this._parentTarget && this._config.headless;
    }

    public async getActiveClient (): Promise<remoteChrome.ProtocolApi | void> {
        try {
            if (!this._clients[this._clientKey])
                this._clients[this._clientKey] = await this._createClient();
        }
        catch (err) {
            debugLog(err);

            return void 0;
        }

        return this._clients[this._clientKey];
    }

    public async init (): Promise<void> {
        try {
            const tabs = await this._getTabs();

            this._parentTarget = tabs.find(t => t.url.includes(this._runtimeInfo.browserId));

            if (!this._parentTarget)
                return;

            const client = await this.getActiveClient();

            if (client) {
                await this._calculateEmulatedDevicePixelRatio(client);
                await this._setupClient(client);

                if (this._isProxyless) {
                    await this._injectProxylessStuff(client);
                    this._setupFramesWatching(client);
                }
            }
        }
        catch (e) {
            return;
        }
    }

    public async getScreenshotData (fullPage?: boolean): Promise<Buffer> {
        let viewportWidth  = 0;
        let viewportHeight = 0;

        const { config, emulatedDevicePixelRatio } = this._runtimeInfo;

        const client = await this.getActiveClient();

        if (!client)
            return Buffer.alloc(0);

        if (fullPage) {
            const { contentSize, visualViewport } = await client.Page.getLayoutMetrics();

            await this._setDeviceMetricsOverride(
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
                await this._setDeviceMetricsOverride(
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

    public async closeTab (): Promise<void> {
        if (this._parentTarget)
            await remoteChrome.Close({ id: this._parentTarget.id, port: this._runtimeInfo.cdpPort });
    }

    public async updateMobileViewportSize (): Promise<void> {
        const client = await this.getActiveClient();

        if (!client)
            return;

        const windowDimensionsQueryResult = await this._evaluateRuntime(client, `(${GET_WINDOW_DIMENSIONS_INFO_SCRIPT})()`, true);

        const windowDimensions = windowDimensionsQueryResult.result.value;

        this._runtimeInfo.viewportSize.width = windowDimensions.outerWidth;
        this._runtimeInfo.viewportSize.height = windowDimensions.outerHeight;
    }

    public async executeClientFunction (command: any, callsite: any): Promise<object> {
        const client = await this.getActiveClient();

        if (!client)
            throw new Error('Cannot get the active browser client');

        const expression = `
            (function () {debugger;
                const proxyless              = window['%proxyless%'];
                const ClientFunctionExecutor = proxyless.ClientFunctionExecutor;
                const executor               = new ClientFunctionExecutor(${JSON.stringify(command)});

                return executor.getResult().then(result => JSON.stringify(result));
            })();
        `;

        let result;
        let exceptionDetails;

        try {
            const script = { expression, awaitPromise: true } as Protocol.Runtime.EvaluateRequest;

            if (this._currentFrameId && this._frameExecutionContexts.has(this._currentFrameId))
                script.contextId = this._frameExecutionContexts.get(this._currentFrameId);

            ({ result, exceptionDetails } = await client.Runtime.evaluate(script));
        }
        catch (e) {
            if (e.response?.code === EXECUTION_CTX_WAS_DESTROYED_CODE)
                throw new ClientFunctionExecutionInterruptionError(command.instantiationCallsiteName, callsite);

            throw e;
        }

        if (exceptionDetails) {
            if (exceptionDetails.exception?.value === DomNodeClientFunctionResultError.name)
                throw new DomNodeClientFunctionResultError(command.instantiationCallsiteName, callsite);

            throw new UncaughtErrorInClientFunctionCode(command.instantiationCallsiteName, exceptionDetails.text, callsite);
        }

        return JSON.parse(result.value);
    }

    private async switchToIframe (): Promise<void> {
        const client = await this.getActiveClient();

        if (!client)
            return;

        const script = { expression: 'window["%switchedIframe%"]' } as Protocol.Runtime.EvaluateRequest;

        if (this._currentFrameId && this._frameExecutionContexts.has(this._currentFrameId))
            script.contextId = this._frameExecutionContexts.get(this._currentFrameId);

        const { result } = await client.Runtime.evaluate(script);

        if (result.subtype !== 'node')
            return;

        const { node } = await client.DOM.describeNode({ objectId: result.objectId });

        if (!node.frameId)
            return;

        this._currentFrameId = node.frameId;
    }

    private switchToMainWindow (): void {
        this._currentFrameId = '';
    }
}
