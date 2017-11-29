import { EventEmitter } from 'events';
import nanoid from 'nanoid';
import PHASE from './phase';
import { assertType, is } from '../errors/runtime/type-assertions';
import wrapTestFunction from '../api/wrap-test-function';
import { resolvePageUrl } from '../api/test-page-url';
import { NavigateToCommand } from '../test-run/commands/actions';
import roleMarker from './marker-symbol';
import delay from '../utils/delay';

const COOKIE_SYNC_DELAY = 100;

class Role extends EventEmitter {
    constructor (loginPage, initFn, options = {}) {
        super();

        this[roleMarker] = true;

        this.id    = nanoid(7);
        this.phase = loginPage ? PHASE.uninitialized : PHASE.initialized;

        this.loginPage = loginPage;
        this.initFn    = initFn;
        this.opts      = options;

        this.url           = null;
        this.stateSnapshot = null;
        this.initErr       = null;
    }

    async _navigateToLoginPage (testRun) {
        var navigateCommand = new NavigateToCommand({ url: this.loginPage });

        await testRun.executeCommand(navigateCommand);
    }

    async _storeStateSnapshot (testRun) {
        if (!this.initErr) {
            // NOTE: give Hammerhead time to sync cookies from client
            await delay(COOKIE_SYNC_DELAY);
            this.stateSnapshot = await testRun.getStateSnapshot();
        }
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

export function createRole (loginPage, initFn, options = {}) {
    assertType(is.string, 'Role', '"loginPage" argument', loginPage);
    assertType(is.function, 'Role', '"initFn" argument', initFn);
    assertType(is.nonNullObject, 'Role', '"options" argument', options);

    if (options.preserveUrl !== void 0)
        assertType(is.boolean, 'Role', '"preserveUrl" option', options.preserveUrl);

    loginPage = resolvePageUrl(loginPage);
    initFn    = wrapTestFunction(initFn);

    return new Role(loginPage, initFn, options);
}

export function createAnonymousRole () {
    return new Role(null, null);
}
