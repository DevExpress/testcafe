import { StateSnapshot } from 'testcafe-hammerhead';
import TestRun from './index';
import { CdpCookieProvider } from '../proxyless/cookie-provider';
import SessionController from './session-controller';

export interface RoleProvider {
    useStateSnapshot: (stateSnapshot: StateSnapshot) => Promise<void>;
    getStateSnapshot: () => Promise<StateSnapshot>;
}

class RoleProviderBase implements RoleProvider {
    protected _testRun: TestRun;

    constructor (testRun: TestRun) {
        this._testRun = testRun;
    }

    get session (): SessionController {
        return this._testRun.session;
    }

    async useStateSnapshot (stateSnapshot: StateSnapshot): Promise<void> {
        this.session.useStateSnapshot(stateSnapshot);
    }

    async getStateSnapshot (): Promise<StateSnapshot> {
        throw new Error('Not implemented');
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
        await super.useStateSnapshot(stateSnapshot);

        const cookieProvider = new CdpCookieProvider(this._testRun);

        const { cookies } = stateSnapshot;

        await cookieProvider.deleteCookies();

        if (cookies)
            await cookieProvider.setCookies(JSON.parse(cookies), '');
    }

}

export class ProxyRoleProvider extends RoleProviderBase implements RoleProvider {
    async getStateSnapshot (): Promise<StateSnapshot> {
        return this.session.getStateSnapshot();
    }
}
