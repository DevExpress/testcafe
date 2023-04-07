import TestRun from '../';
import { StoragesProvider, StoragesProviderBase } from './base';
import { CdpStoragesProvider } from '../../native-automation/storages-provider';

export class StoragesProviderFactory {
    public static create (testRun: TestRun, isNativeAutomation: boolean): StoragesProvider {
        return isNativeAutomation ? new CdpStoragesProvider(testRun) : new StoragesProviderBase(testRun);
    }
}
