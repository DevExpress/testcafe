import { DashboardConfigStorageBase, DashboardConfigOptions } from './base';

export class DashboardConfigStorage extends DashboardConfigStorageBase {
    protected async readOptions (): Promise<DashboardConfigOptions> {
        return Promise.resolve(null);
    }
}

export default new DashboardConfigStorage();
