export type DashboardConfigOptions = { token: string } | null;

export abstract class DashboardConfigStorageBase {
    public options: DashboardConfigOptions;

    public constructor () {
        this.options = null;
    }

    public async load (): Promise<void> {
        this.options = await this.readOptions();
    }

    protected abstract async readOptions (): Promise<DashboardConfigOptions>;
}
