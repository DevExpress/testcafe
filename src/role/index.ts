import { EventEmitter } from 'events';
import nanoid from 'nanoid';
import RolePhase from './phase';
import { assertType, is } from '../errors/runtime/type-assertions';
import wrapTestFunction from '../api/wrap-test-function';
import { resolvePageUrl } from '../api/test-page-url';
import roleMarker from './marker-symbol';
import { StateSnapshot } from 'testcafe-hammerhead';
import TestRun from '../test-run';

interface RoleOptions {
    preserveUrl?: boolean;
}

class Role extends EventEmitter {
    public id: string;
    public phase: RolePhase;
    public loginUrl: string | null;
    public redirectUrl: string | null;
    private readonly _initFn: Function | null;
    public opts: RoleOptions;
    public initErr: null | Error;

    constructor (loginUrl: string | null, initFn: Function | null, options = {}) {
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

    private async _executeInitFn (testRun: TestRun): Promise<void> {
        try {
            let fn = () => (this._initFn as Function)(testRun);

            fn = testRun.decoratePreventEmitActionEvents(fn, { prevent: false });
            fn = testRun.decorateDisableDebugBreakpoints(fn, { disable: false });

            await fn();
        }
        catch (err) {
            this.initErr = err;
        }
    }

    public async initialize (testRun: TestRun): Promise<void> {
        this.phase = RolePhase.pendingInitialization;

        await testRun.switchToCleanRun(this.loginUrl);

        await this._executeInitFn(testRun);
        await this._storeStateSnapshot(testRun);

        if (this.opts.preserveUrl)
            await this.setCurrentUrlAsRedirectUrl(testRun);

        this.phase = RolePhase.initialized;
        this.emit('initialized');
    }

    async setCurrentUrlAsRedirectUrl(testRun: TestRun): Promise<void> {
        this.redirectUrl = await testRun.getCurrentUrl();
    }
}

export function createRole (loginPage: string, initFn: Function, options: RoleOptions = { preserveUrl: false}): Role {
    assertType(is.string, 'Role', '"loginPage" argument', loginPage);
    assertType(is.function, 'Role', '"initFn" argument', initFn);

    if (options.preserveUrl !== void 0)
        assertType(is.boolean, 'Role', '"preserveUrl" option', options.preserveUrl);

    loginPage = resolvePageUrl(loginPage);
    initFn    = wrapTestFunction(initFn);

    return new Role(loginPage, initFn, options);
}

export function createAnonymousRole () {
    return new Role(null, null);
}
