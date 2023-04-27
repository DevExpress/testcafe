import { ProtocolApi } from 'chrome-remote-interface';
import BrowserConnection from '../browser/connection';
import TestRun from '../test-run';
import { NativeAutomationInitOptions } from '../shared/types';
import AsyncEventEmitter from '../utils/async-event-emitter';

export default class NativeAutomationApiBase extends AsyncEventEmitter {
    protected readonly _client: ProtocolApi;
    protected readonly _browserConnection: BrowserConnection;
    protected readonly options: NativeAutomationInitOptions;
    protected _stopped: boolean;
    private _cdpEventsInitialized: boolean;

    constructor (browserId: string, client: ProtocolApi, options: NativeAutomationInitOptions) {
        super();

        this._client               = client;
        this._browserConnection    = BrowserConnection.getById(browserId) as BrowserConnection;
        this.options               = options;
        this._stopped              = true;
        this._cdpEventsInitialized = false;
    }

    private async onceCDPEventsInitialize (): Promise<void> {
        if (this._cdpEventsInitialized)
            return;

        await this._addCDPEventListeners();

        this._cdpEventsInitialized = true;
    }

    protected async _addCDPEventListeners (): Promise<void> {} // eslint-disable-line @typescript-eslint/no-empty-function

    public async start (): Promise<void> {
        this._stopped = false;

        await this.onceCDPEventsInitialize();
    }

    public async stop (): Promise<void> {
        this._stopped = true;
    }

    protected get _testRun (): TestRun {
        return this._browserConnection.getCurrentTestRun() as TestRun;
    }

    protected async _getCurrentUrl (): Promise<URL> {
        const { frameTree } = await this._client.Page.getFrameTree();

        return new URL(frameTree.frame.url);
    }
}
