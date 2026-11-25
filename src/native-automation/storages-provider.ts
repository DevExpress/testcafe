import remoteChrome from 'chrome-remote-interface';
import { getActiveClient } from './utils/get-active-client';
import { StoragesProvider, StoragesProviderBase } from '../test-run/storages/base';
import { getStorageOrigin } from './visited-origins';
import { storagesProviderLogger } from '../utils/debug-loggers';

export class CdpStoragesProvider extends StoragesProviderBase implements StoragesProvider {
    private async _getCdpClient (): Promise<remoteChrome.ProtocolApi> {
        const browserConnection = this.testRun.browserConnection;

        return getActiveClient(browserConnection);
    }

    async clearStorages (): Promise<void> {
        const { visitedOrigins } = this.testRun.browserConnection;
        const client             = await this._getCdpClient();
        const origins            = new Set(visitedOrigins.take());
        const pageOrigin         = getStorageOrigin(this.testRun.test.pageUrl);

        if (pageOrigin)
            origins.add(pageOrigin);

        for (const origin of origins) {
            try {
                await client.Storage.clearDataForOrigin({ origin, storageTypes: 'all' });
            }
            catch (err) {
                storagesProviderLogger('Failed to clear storages for origin %s: %s', origin, err);

                visitedOrigins.track(origin);
            }
        }
    }
}
