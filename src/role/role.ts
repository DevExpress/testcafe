import { EventEmitter } from 'events';
import RolePhase from './phase';
import { StateSnapshot } from 'testcafe-hammerhead';
import roleMarker from './marker-symbol';
import nanoid from 'nanoid';
import TestRun from '../test-run';
import TestRunProxy from '../services/compiler/test-run-proxy';


export default class Role extends EventEmitter {
    public id: string;
    public phase: RolePhase;
    public loginUrl: string | null;
    public redirectUrl: string | null;
    private readonly _initFn: Function | null;
    public opts: RoleOptions;
    public initErr: null | Error;
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

    private async _storeStateSnapshot (testRun: TestRun | TestRunProxy): Promise<void> {
        if (this.initErr)
            return;

        this.stateSnapshot = await testRun.getStateSnapshot();
    }

    private async _executeInitFn (testRun: TestRun | TestRunProxy): Promise<void> {
        try {
            let fn = (): Promise<void> => (this._initFn as Function)(testRun);

            fn = testRun.decoratePreventEmitActionEvents(fn, { prevent: false });
            fn = testRun.decorateDisableDebugBreakpoints(fn, { disable: false });

            await fn();
        }
        catch (err) {
            this.initErr = err;
        }
    }

    public async initialize (testRun: TestRun | TestRunProxy): Promise<void> {
        this.phase = RolePhase.pendingInitialization;

        await testRun.switchToCleanRun(this.loginUrl as string);

        await this._executeInitFn(testRun);
        await this._storeStateSnapshot(testRun);

        if (this.opts.preserveUrl)
            await this.setCurrentUrlAsRedirectUrl(testRun);

        this.phase = RolePhase.initialized;

        this.emit('initialized');
    }

    public async setCurrentUrlAsRedirectUrl (testRun: TestRun | TestRunProxy): Promise<void> {
        this.redirectUrl = await testRun.getCurrentUrl();
    }
}
