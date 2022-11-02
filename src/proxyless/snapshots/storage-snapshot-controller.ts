import TestRun from '../../test-run';
import { StateSnapshot } from 'testcafe-hammerhead';
import SessionController from '../../test-run/session-controller';

export class ProxylessStorageSnapshotController {
    private _testRun: TestRun;

    constructor (testRun: TestRun) {
        this._testRun = testRun;
    }

    private get session (): SessionController {
        return this._testRun.session;
    }

    private get pendingSnapshot (): StateSnapshot {
        // @ts-ignore
        return this.session.pendingStateSnapshot;
    }

    private _createRestoreStoragesScript (storageName: 'localStorage' | 'sessionStorage', url: string): string {
        if (!this.pendingSnapshot)
            return '';

        const { host } = new URL(url);
        const { storages } = this.pendingSnapshot;
        const storageValue = storages[storageName];

        return `
            (function() {
                window.${storageName}.setItem('${this.session.getStorageKey(host)}', '${storageValue}')
            })();
        `;
    }

    public createRestoreStoragesScripts (url?: string): string[] {
        if (!this.pendingSnapshot || !url)
            return [];

        const localStorageScript = this._createRestoreStoragesScript('localStorage', url);
        const sessionStorageScript = this._createRestoreStoragesScript('sessionStorage', url);

        // @ts-ignore
        this.session.pendingStateSnapshot = null;

        return [localStorageScript, sessionStorageScript];
    }
}
