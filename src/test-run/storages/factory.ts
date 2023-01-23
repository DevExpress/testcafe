import TestRun from '../';
import { StoragesProvider, StoragesProviderBase } from './base';
import { CdpStoragesProvider } from '../../proxyless/storages-provider';

export class StoragesProviderFactory {
    public static create (testRun: TestRun, isProxyless: boolean): StoragesProvider {
        return isProxyless ? new CdpStoragesProvider(testRun) : new StoragesProviderBase(testRun);
    }
}
