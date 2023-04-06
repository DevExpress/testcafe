import remoteChrome from 'chrome-remote-interface';
import { getActiveClient } from './utils/get-active-client';
import { StoragesProvider, StoragesProviderBase } from '../test-run/storages/base';

export class CdpStoragesProvider extends StoragesProviderBase implements StoragesProvider {
    private async _getCdpClient (): Promise<remoteChrome.ProtocolApi> {
        const browserConnection = this.testRun.browserConnection;

        return getActiveClient(browserConnection);
    }

    async clearStorages (): Promise<void> {
        const client = await this._getCdpClient();

        await client.Storage.clearDataForOrigin({ origin: '*', storageTypes: 'all' });
    }
}
