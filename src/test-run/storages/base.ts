import TestRun from '../';

export interface StoragesProvider {
    initialize: () => Promise<void>,
    clearStorages: () => Promise<void>
}

export class StoragesProviderBase implements StoragesProvider {
    protected testRun: TestRun;

    constructor (testRun: TestRun) {
        this.testRun = testRun;
    }

    async initialize (): Promise<void> {
        return this.clearStorages();
    }

    async clearStorages (): Promise<void> {
        return Promise.resolve();
    }
}
