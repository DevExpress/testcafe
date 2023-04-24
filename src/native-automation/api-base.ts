import { ProtocolApi } from 'chrome-remote-interface';
import BrowserConnection from '../browser/connection';
import TestRun from '../test-run';
import { notImplementedError } from './errors';
import { NativeAutomationInitOptions } from '../shared/types';

export default class NativeAutomationApiBase {
    protected readonly _client: ProtocolApi;
    protected readonly _browserConnection: BrowserConnection;
    protected readonly options: NativeAutomationInitOptions;

    constructor (browserId: string, client: ProtocolApi, options: NativeAutomationInitOptions) {
        this._client            = client;
        this._browserConnection = BrowserConnection.getById(browserId) as BrowserConnection;
        this.options            = options;
    }

    public async start (): Promise<void> {
        throw notImplementedError();
    }

    protected get _testRun (): TestRun {
        return this._browserConnection.getCurrentTestRun() as TestRun;
    }

    protected async _getCurrentUrl (): Promise<URL> {
        const { frameTree } = await this._client.Page.getFrameTree();

        return new URL(frameTree.frame.url);
    }
}
