import { StateSnapshot } from 'testcafe-hammerhead';
import TestRun from './index';
import { CdpCookieProvider } from '../proxyless/cookie-provider';
import SessionController from './session-controller';

export interface RoleProvider {
    useStateSnapshot: (stateSnapshot: StateSnapshot) => Promise<void>;
    getStateSnapshot: () => Promise<StateSnapshot>;
}

class RoleProviderBase {
    protected _testRun: TestRun;

    constructor (testRun: TestRun) {
        this._testRun = testRun;
    }

    get session (): SessionController {
        return this._testRun.session;
    }
}

export class ProxylessRoleProvider extends RoleProviderBase implements RoleProvider {
    private _cookieProvider: CdpCookieProvider;

    constructor (testRun: TestRun) {
        super(testRun);

        this._cookieProvider = new CdpCookieProvider(testRun);
    }

    async getStateSnapshot (): Promise<StateSnapshot> {
        const cookies = await this._cookieProvider.getCookies([]);

        return new StateSnapshot(JSON.stringify(cookies), null);
    }

    async useStateSnapshot (stateSnapshot: StateSnapshot): Promise<void> {
        const { cookies } = stateSnapshot;

        await this._cookieProvider.deleteCookies();

        if (cookies)
            await this._cookieProvider.setCookies(JSON.parse(cookies), '');

        this._testRun.saveStoragesSnapshot(stateSnapshot.storages);
    }
}

export class ProxyRoleProvider extends RoleProviderBase implements RoleProvider {
    async getStateSnapshot (): Promise<StateSnapshot> {
        return this.session.getStateSnapshot();
    }

    async useStateSnapshot (stateSnapshot: StateSnapshot): Promise<void> {
        await this.session.useStateSnapshot(stateSnapshot);
    }
}
