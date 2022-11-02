import {
    Cookies,
    StateSnapshot,
    TaskScriptOpts,
} from 'testcafe-hammerhead';

import { CdpCookieProvider } from '../proxyless/cookie-provider';
import { CookieProvider } from '../test-run/cookies/base';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import SessionController from '../test-run/session';

// NOTE: Proxyless cookie implementation doesn't require client-server communication.
// This stub was created to reduce conditional logic in connected classes.
class ProxylessCookieStub {
    getClientString (): string {
        return '';
    }

    takePendingSyncCookies (): string[] {
        return [];
    }
}

export class ProxylessSessionController extends SessionController {
    private _cookieProvider: CookieProvider | null;
    private _event: RequestPausedEvent | null;
    private pendingStateSnapshot: StateSnapshot | null = null;

    constructor (uploadRoots: string[], options: Partial<SessionOptions>) {
        super(uploadRoots, options);

        this._cookieProvider = null;
        this._event = null;
    }

    get cookieProvider (): CookieProvider {
        if (!this._cookieProvider)
            this._cookieProvider = new CdpCookieProvider(this.currentTestRun);

        return this._cookieProvider;
    }

    createCookies (): Cookies {
        // @ts-ignore
        return new ProxylessCookieStub();
    }

    getStateSnapshot (): Promise<StateSnapshot> | StateSnapshot {
        return this.cookieProvider.getCookies([], [])
            .then(cookies => {
                return new StateSnapshot(JSON.stringify(cookies), null);
            });
    }

    async _restoreCookieState (): Promise<void> {
        if (!this.pendingStateSnapshot)
            return;

        const { cookies } = this.pendingStateSnapshot;

        await this.cookieProvider.deleteCookies();

        if (cookies)
            await this.cookieProvider.setCookies(JSON.parse(cookies), '');
    }

    _createRestoreStoragesScript (storageName: 'localStorage' | 'sessionStorage'): string {
        if (!this.pendingStateSnapshot || !this._event)
            return '';

        const { host } = new URL(this._event.request.url);
        const { storages } = this.pendingStateSnapshot;
        const storageValue = storages[storageName];

        return `
            (function() {
                window.${storageName}.setItem('${this.getStorageKey(host)}', '${storageValue}')
            })();
        `;
    }

    async getTaskScript (options: TaskScriptOpts): Promise<string> {
        let result = '';

        result += this._createRestoreStoragesScript('localStorage');
        result += this._createRestoreStoragesScript('sessionStorage');

        result += await super.getTaskScript(options);

        return result;
    }

    async onProxylessPageResponseStart (event: RequestPausedEvent): Promise<void> {
        this._event = event;

        await this._restoreCookieState();
    }

    async onProxylessPageResponseEnd (): Promise<void> {
        this.pendingStateSnapshot = null;

        this._event = null;
    }
}
