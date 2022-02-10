// NOTE: Initializer should be the first
import './shared-adapter-initializer';

import { readSync as read } from 'read-file-relative';
import { Dictionary } from '../../../../../../configuration/interfaces';
import Protocol from 'devtools-protocol';
import path from 'path';
import os from 'os';
import remoteChrome from 'chrome-remote-interface';
import debug from 'debug';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../../../utils/client-functions';
import WARNING_MESSAGE from '../../../../../../notifications/warning-message';
import * as SharedErrors from '../../../../../../shared/errors';

import {
    Config,
    RuntimeInfo,
    TouchConfigOptions,
    Size,
} from '../interfaces';
import prettyTime from 'pretty-hrtime';
import { CheckedCDPMethod, ELAPSED_TIME_UPPERBOUNDS } from '../elapsed-upperbounds';
import guardTimeExecution from '../../../../../../utils/guard-time-execution';
import { CallsiteRecord } from 'callsite-record';
import { ExecuteClientFunctionCommand, ExecuteSelectorCommand } from '../../../../../../test-run/commands/observation';
import ClientFunctionExecutor from './client-function-executor';
import { NavigateToCommand, SwitchToIframeCommand } from '../../../../../../test-run/commands/actions';
import ExecutionContext from './execution-context';
import * as clientsManager from './clients-manager';
import COMMAND_TYPE from '../../../../../../test-run/commands/type';
import { ActionCommandBase, CommandBase } from '../../../../../../test-run/commands/base';
import ConsoleCollector from './console-collector';
import ActionExecutor from '../../../../../../shared/actions/action-executor';
import BarriersComplex from '../../../../../../shared/barriers/complex-barrier';
import ClientRequestEmitter from './barriers/emitters/client-request';
import ScriptExecutionEmitter from './barriers/emitters/script-execution';
import PageUnloadBarrier from './barriers/page-unload-barrier';
import { AutomationErrorCtors } from '../../../../../../shared/types';
import ClickAutomation from '../../../../../../shared/actions/automations/click';
import Cursor from '../../../../../../shared/actions/cursor';
import { CursorUICdp } from './utils/cursor';
import { ServerNode } from './types';

const DEBUG_SCOPE = (id: string): string => `testcafe:browser:provider:built-in:chrome:browser-client:${id}`;
const DOWNLOADS_DIR = path.join(os.homedir(), 'Downloads');

const debugLog = debug('testcafe:browser:provider:built-in:dedicated:chrome');

interface ConsoleMessages {
    log: string[];
    warn: string[];
    error: string[];
    info: string[];
}

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.click] = {
    create: (command, elements) => {
        const cursorUI = new CursorUICdp();
        const cursor   = new Cursor(ExecutionContext.current, cursorUI);

        // @ts-ignore
        return new ClickAutomation(elements[0], command.options, ExecutionContext.current, cursor);
    },
};

export class BrowserClient {
    private _clients: Dictionary<remoteChrome.ProtocolApi> = {};
    private _runtimeInfo: RuntimeInfo;
    private readonly _proxyless: boolean;
    private _parentTarget?: remoteChrome.TargetInfo;
    private readonly debugLogger: debug.Debugger;
    private readonly _clientFunctionExecutor: ClientFunctionExecutor;
    private readonly _consoleCollector: ConsoleCollector;

    public constructor (runtimeInfo: RuntimeInfo, proxyless: boolean) {
        this._runtimeInfo = runtimeInfo;
        this.debugLogger  = debug(DEBUG_SCOPE(runtimeInfo.browserId));
        this._proxyless   = proxyless;

        this._clientFunctionExecutor = new ClientFunctionExecutor();
        this._consoleCollector       = new ConsoleCollector(['log', 'warning', 'error', 'info']);

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
        const target = await this._getActiveTab();
        const client = await remoteChrome({ target, port: this._runtimeInfo.cdpPort });

        const { Page, Network, Runtime, DOM, CSS, Overlay } = client;

        this._clients[this._clientKey] = client;

        await guardTimeExecution(
            async () => await Page.enable(),
            elapsedTime => this._checkDropOfPerformance(CheckedCDPMethod.PageEnable, elapsedTime)
        );

        await Network.enable({});
        await Runtime.enable();

        if (this._proxyless) {
            await DOM.enable();
            await CSS.enable();
            await Overlay.enable();
        }

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

    private static async _injectProxylessStuff (client: remoteChrome.ProtocolApi): Promise<void> {
        const script = read('../../../../../../../lib/client/proxyless/index.js') as string;

        await client.Page.addScriptToEvaluateOnNewDocument({
            source: script,
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

                if (this._proxyless) {
                    await BrowserClient._injectProxylessStuff(client);
                    ExecutionContext.initialize(client);
                    clientsManager.setClient(client);
                    this._consoleCollector.initialize(client.Runtime);
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

    public async executeClientFunction (command: ExecuteClientFunctionCommand, callsite: CallsiteRecord): Promise<object> {
        const client = await this.getActiveClient();

        if (!client)
            throw new Error('Cannot get the active browser client');

        return this._clientFunctionExecutor.executeClientFunction(client.Runtime, command, callsite);
    }

    public async executeSelector (command: ExecuteSelectorCommand, callsite: CallsiteRecord, selectorTimeout: number): Promise<object> {
        const client = await this.getActiveClient();

        if (!client)
            throw new Error('Cannot get the active browser client');

        return this._clientFunctionExecutor.executeSelector({
            Runtime:  client.Runtime,
            errCtors: {
                notFound:  SharedErrors.CannotObtainInfoForElementSpecifiedBySelectorError.name,
                invisible: SharedErrors.CannotObtainInfoForElementSpecifiedBySelectorError.name,
            },

            command, callsite, selectorTimeout,
        });
    }

    public async switchToIframe (command: SwitchToIframeCommand, callsite: CallsiteRecord, selectorTimeout: number): Promise<void> {
        const client = await this.getActiveClient();

        if (!client)
            return;

        const selector = command.selector;

        if (typeof selector.timeout === 'number')
            selectorTimeout = selector.timeout;

        selector.needError = true;

        const node = await this._clientFunctionExecutor.getNode({
            DOM:      client.DOM,
            Runtime:  client.Runtime,
            command:  selector,
            errCtors: {
                notFound:  SharedErrors.ActionElementNotFoundError.name,
                invisible: SharedErrors.ActionElementIsInvisibleError.name,
            },

            callsite, selectorTimeout,
        });

        if (!node.frameId)
            throw new SharedErrors.ActionElementNotIframeError(callsite);

        ExecutionContext.switchToIframe(node.frameId);
    }

    public switchToMainWindow (): void {
        ExecutionContext.switchToMainWindow();
    }

    public async navigateTo (command: NavigateToCommand): Promise<object> {
        const client = await this.getActiveClient();

        if (!client)
            throw new Error('Cannot get the active browser client');

        const { Page } = client;

        Page.navigate({ url: command.url });

        return new Promise(resolve => {
            const offEvent = Page.on('domContentEventFired', () => {
                // @ts-ignore
                offEvent();
                resolve();
            });
        });
    }

    public readConsoleMessages (): ConsoleMessages {
        const { warning, ...massages } = this._consoleCollector.read();

        // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
        return { warn: warning, ...massages } as ConsoleMessages;
    }

    private async executeAction (command: ActionCommandBase, callsite: CallsiteRecord, opts: Dictionary<OptionValue>): Promise<unknown> {
        const client = await this.getActiveClient();

        if (!client)
            throw new Error('Cannot get the active browser client');

        const executeSelectorCb = (selector: ExecuteSelectorCommand, errCtors: AutomationErrorCtors, startTime: number): Promise<ServerNode> => {
            return this._clientFunctionExecutor.getNode({
                DOM:      client.DOM,
                Runtime:  client.Runtime,
                command:  selector,
                errCtors: {
                    invisible: errCtors.invisible as string,
                    notFound:  errCtors.notFound as string,
                },

                selectorTimeout: opts.selectorTimeout as number,
                callsite, startTime,
            });
        };

        const executor = new ActionExecutor(command, opts.selectorTimeout as number, opts.speed as number, executeSelectorCb);

        const clientRequestEmitter   = new ClientRequestEmitter(client.Network, ExecutionContext.current.frameId);
        const scriptExecutionEmitter = new ScriptExecutionEmitter(client.Network, ExecutionContext.current.frameId);
        const pageUnloadBarrier      = new PageUnloadBarrier(client.Page, ExecutionContext.current.frameId);
        const barriers               = new BarriersComplex(clientRequestEmitter, scriptExecutionEmitter, pageUnloadBarrier);

        return executor.execute(barriers);
        // TODO: client side behavior
        // .then(elements => createReplicator(new SelectorElementActionTransform()).encode(elements));
    }

    public async executeCommand (command: CommandBase, callsite: CallsiteRecord, opts: Dictionary<OptionValue>): Promise<unknown> {
        switch (command.type) {
            case COMMAND_TYPE.executeClientFunction:
                return this.executeClientFunction(command as ExecuteClientFunctionCommand, callsite);
            case COMMAND_TYPE.switchToIframe:
                return this.switchToIframe(command as SwitchToIframeCommand, callsite, opts.selectorTimeout as number);
            case COMMAND_TYPE.switchToMainWindow:
                return this.switchToMainWindow();
            case COMMAND_TYPE.executeSelector:
                return this.executeSelector(command as ExecuteSelectorCommand, callsite, opts.selectorTimeout as number);
            case COMMAND_TYPE.navigateTo:
                return this.navigateTo(command as NavigateToCommand);
            case COMMAND_TYPE.testDone:
                return null;
            case COMMAND_TYPE.getBrowserConsoleMessages:
                return null;
            case COMMAND_TYPE.click:
                return this.executeAction(command as ActionCommandBase, callsite, opts);
            default:
                throw new Error(`The "${command.type}" command is not supported currently in proxyless mode! ` + JSON.stringify(command));
        }
    }
}
