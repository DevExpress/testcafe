import remoteChrome from 'chrome-remote-interface';
import { getActiveClient } from './utils/get-active-client';
import { StoragesProvider, StoragesProviderBase } from '../test-run/storages/base';
import { getVisitedOrigins, getVisitedStorageKeys } from './visited-storages';
import BrowserConnection from '../browser/connection';

const WILDCARD_REJECTED_MESSAGE = 'is not a valid URL';

const wildcardRejected = new WeakSet<BrowserConnection>();

export class CdpStoragesProvider extends StoragesProviderBase implements StoragesProvider {
    private async _getCdpClient (): Promise<remoteChrome.ProtocolApi> {
        const browserConnection = this.testRun.browserConnection;

        return getActiveClient(browserConnection);
    }

    private async _clearAllOrigins (client: remoteChrome.ProtocolApi, connection: BrowserConnection): Promise<boolean> {
        if (wildcardRejected.has(connection))
            return false;

        try {
            await client.Storage.clearDataForOrigin({ origin: '*', storageTypes: 'all' });

            return true;
        }
        catch (err: any) {
            if (!String(err?.message).includes(WILDCARD_REJECTED_MESSAGE))
                throw err;

            wildcardRejected.add(connection);

            return false;
        }
    }

    async clearStorages (): Promise<void> {
        const connection = this.testRun.browserConnection;
        const client     = await this._getCdpClient();

        if (await this._clearAllOrigins(client, connection))
            return;

        await Promise.all([
            ...getVisitedOrigins(connection).map(origin => client.Storage.clearDataForOrigin({ origin, storageTypes: 'all' })),
            ...getVisitedStorageKeys(connection).map(storageKey => client.Storage.clearDataForStorageKey({ storageKey, storageTypes: 'all' })),
        ]);
    }
}
