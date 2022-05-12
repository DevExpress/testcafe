import { SafeStorage } from 'testcafe-safe-storage';


// TODO: make this properties required
export interface DashboardConfigOptions {
    token?: string;
    sendReport?: boolean;
}

const DEFAULT_DASHBOARD_OPTIONS: DashboardConfigOptions = {
    token:      '',
    sendReport: false,
};

export default class DashboardConfigStorage {
    public options: DashboardConfigOptions;
    private _storage: SafeStorage<DashboardConfigOptions>;

    public constructor () {
        this.options  = {};
        this._storage = new SafeStorage<DashboardConfigOptions>();
    }

    public async load (): Promise<void> {
        this.options = await this._storage.tryLoad() || DEFAULT_DASHBOARD_OPTIONS;
    }

    public async save (): Promise<void> {
        await this._storage.save(this.options);
    }
}
