import { ProtocolApi } from 'chrome-remote-interface';
import BrowserConnection from '../browser/connection';
import TestRun from '../test-run';

export default class ProxylessApiBase {
    protected readonly _client: ProtocolApi;
    protected readonly _browserConnection: BrowserConnection;

    constructor (browserId: string, client: ProtocolApi) {
        this._client = client;
        this._browserConnection = BrowserConnection.getById(browserId) as BrowserConnection;
    }

    public async init (): Promise<void> {
        throw new Error('Not implemented');
    }

    protected get _testRun (): TestRun {
        return this._browserConnection.getCurrentTestRun() as TestRun;
    }

    protected async _getCurrentUrl (): Promise<URL> {
        const { frameTree } = await this._client.Page.getFrameTree();

        return new URL(frameTree.frame.url);
    }
}
