import { EventEmitter } from 'events';
import PHASE from './phase';
import { resolvePageUrl } from '../api/test-page-url';
import { NavigateToCommand } from '../test-run/commands/actions';
import roleMarker from './marker-symbol';
import { StateSnapshot } from 'testcafe-hammerhead';

class Role extends EventEmitter {
    constructor (id, loginPage, initFn, options = {}) {
        super();

        this[roleMarker] = true;

        this.id    = id;
        this.phase = loginPage ? PHASE.uninitialized : PHASE.initialized;

        this.loginPage = loginPage;
        this.initFn    = initFn;
        this.opts      = options;

        this.url           = null;
        this.stateSnapshot = StateSnapshot.empty();
        this.initErr       = null;
    }

    async _navigateToLoginPage (testRun) {
        const navigateCommand = new NavigateToCommand({
            url:         this.loginPage,
            forceReload: true
        });

        await testRun.executeCommand(navigateCommand);
    }

    async _storeStateSnapshot (testRun) {
        if (this.initErr)
            return;

        this.stateSnapshot = await testRun.getStateSnapshot();
    }

    async _executeInitFn (testRun) {
        try {
            testRun.disableDebugBreakpoints = false;
            await this.initFn(testRun);
        }
        catch (err) {
            this.initErr = err;
        }
        finally {
            testRun.disableDebugBreakpoints = true;
        }
    }

    async initialize (testRun) {
        this.phase = PHASE.pendingInitialization;

        await testRun.switchToCleanRun();
        await this._navigateToLoginPage(testRun);
        await this._executeInitFn(testRun);
        await this._storeStateSnapshot(testRun);

        if (this.opts.preserveUrl)
            this.url = await testRun.getCurrentUrl();

        this.phase = PHASE.initialized;
        this.emit('initialized');
    }
}

export function createRole (id, loginPage, initFn, options = {}) {
    loginPage = resolvePageUrl(loginPage);

    return new Role(id, loginPage, initFn, options);
}
