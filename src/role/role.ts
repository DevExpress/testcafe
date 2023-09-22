import { EventEmitter } from 'events';
import RolePhase from './phase';
import { StateSnapshot } from 'testcafe-hammerhead';
import roleMarker from './marker-symbol';
import { nanoid } from 'nanoid';
import TestRun from '../test-run';
import TestCafeErrorList from '../errors/error-list';
import {
    getUrl,
    assertRoleUrl,
} from '../api/test-page-url';

export interface RedirectUrl {
    [testId: string]: string;
}

export default class Role extends EventEmitter {
    public id: string;
    public phase: RolePhase;
    public loginUrl: string | null;
    public redirectUrl: RedirectUrl | string | null;
    public _initFn: Function | null;
    public opts: RoleOptions;
    public initErr: null | Error | TestCafeErrorList;
    public stateSnapshot: StateSnapshot;
    private [roleMarker]: boolean;

    public constructor (loginUrl: string | null, initFn: Function | null, options = {}) {
        super();

        this[roleMarker]   = true;
        this.id            = nanoid(7);
        this.phase         = loginUrl ? RolePhase.uninitialized : RolePhase.initialized;
        this.loginUrl      = loginUrl;
        this._initFn       = initFn;
        this.opts          = options;
        this.redirectUrl   = null;
        this.stateSnapshot = StateSnapshot.empty();
        this.initErr       = null;
    }

    private async _storeStateSnapshot (testRun: TestRun): Promise<void> {
        if (this.initErr)
            return;

        this.stateSnapshot = await testRun.getStateSnapshot();
    }

    private async _setInitError (err: Error): Promise<void> {
        this.initErr = err;
    }

    private async _executeInitFn (testRun: TestRun): Promise<void> {
        if (this.initErr)
            return;

        try {
            let fn = (): Promise<void> => (this._initFn as Function)(testRun);

            fn = testRun.decoratePreventEmitActionEvents(fn, { prevent: false });
            fn = testRun.decorateDisableDebugBreakpoints(fn, { disable: false });

            await fn();
        }
        catch (err: any) {
            await this._setInitError(err);
        }
    }

    private _prepareLoginUrl (loginUrl: string, baseUrl: string): string {
        if (!baseUrl)
            assertRoleUrl(loginUrl, 'role');

        return getUrl(loginUrl, baseUrl ? new URL(baseUrl) : void 0);
    }

    private async _switchToCleanRun (testRun: TestRun): Promise<void> {
        try {
            if (this.loginUrl)
                this.loginUrl = this._prepareLoginUrl(this.loginUrl as string, testRun.baseUrl as string);

            await testRun.switchToCleanRun(this.loginUrl as string);
        }
        catch (err: any) {
            await this._setInitError(err);
        }
    }

    public async initialize (testRun: TestRun): Promise<void> {
        this.phase = RolePhase.pendingInitialization;

        await this._switchToCleanRun(testRun);
        await this._executeInitFn(testRun);
        await this._storeStateSnapshot(testRun);

        if (this.opts.preserveUrl)
            await this.setCurrentUrlAsRedirectUrl(testRun);

        this.phase = RolePhase.initialized;

        this.emit('initialized');
    }

    public async setCurrentUrlAsRedirectUrl (testRun: TestRun): Promise<void> {
        const currentUrl = await testRun.getCurrentUrl();

        if (this.opts.preserveUrl)
            this.redirectUrl = currentUrl;
        else {
            this.redirectUrl = this.redirectUrl || {};
            (this.redirectUrl as RedirectUrl)[testRun.test.id] = currentUrl;
        }
    }

    public static from (init: unknown): Role | null {
        if (!init)
            return null;

        const serializedRole = init as Role;

        const role = new Role(serializedRole.loginUrl, serializedRole._initFn, serializedRole.opts);

        role.id            = serializedRole.id;
        role.phase         = serializedRole.phase;
        role.redirectUrl   = serializedRole.redirectUrl;
        role.stateSnapshot = serializedRole.stateSnapshot;
        role.initErr       = serializedRole.initErr;

        return role;
    }
}
