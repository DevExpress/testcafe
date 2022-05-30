import { SafeStorage } from 'testcafe-safe-storage';


// TODO: make this properties required
export interface DashboardConfigOptions {
    token?: string;
    sendReport?: boolean;
}

const DEFAULT_DASHBOARD_OPTIONS: DashboardConfigOptions = {
    token: '',

    // NOTE: we should send reports to the dashboard until it is disabled explicitly
    sendReport: true,
};

export default class DashboardConfigStorage {
    public options: DashboardConfigOptions;
    private _storage: SafeStorage<DashboardConfigOptions>;

    public constructor () {
        this.options  = {};
        this._storage = new SafeStorage<DashboardConfigOptions>();
    }

    public async load (): Promise<boolean> {
        const result        = await this._storage.tryLoad<DashboardConfigOptions>();
        const storageExists = result !== void 0;

        this.options = result || DEFAULT_DASHBOARD_OPTIONS;

        return storageExists;
    }

    public async save (): Promise<void> {
        await this._storage.save(this.options);
    }
}
