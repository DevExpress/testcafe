import { SafeStorage } from 'testcafe-safe-storage';
import { DasboardOptions } from './interfaces';

const DEFAULT_DASHBOARD_OPTIONS: DasboardOptions = {
    token: '',

    // NOTE: we should send reports to the dashboard until it is disabled explicitly
    sendReport: true,
};

export default class DashboardConfigStorage {
    public options: DasboardOptions;
    private _storage: SafeStorage<DasboardOptions>;

    public constructor () {
        this.options  = {};
        this._storage = new SafeStorage<DasboardOptions>();
    }

    public async load (): Promise<boolean> {
        const result        = await this._storage.tryLoad<DasboardOptions>();
        const storageExists = result !== void 0;

        this.options = result || { ...DEFAULT_DASHBOARD_OPTIONS };

        return storageExists;
    }

    public async save (): Promise<void> {
        await this._storage.save(this.options);
    }
}
