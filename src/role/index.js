import { EventEmitter } from 'events';
import shortId from 'shortid';
import PHASE from './phase';
import { assertType, is } from '../errors/runtime/type-assertions';
import wrapTestFunction from '../api/wrap-test-function';
import { resolvePageUrl } from '../api/test-page-url';
import { NavigateToCommand } from '../test-run/commands/actions';
import roleMarker from './marker-symbol';
import delay from '../utils/delay';

const COOKIE_SYNC_DELAY = 100;

class Role extends EventEmitter {
    constructor (loginPage, initFn) {
        super();

        this[roleMarker] = true;

        this.id    = shortId.generate();
        this.phase = loginPage ? PHASE.uninitialized : PHASE.initialized;

        this.loginPage = loginPage;
        this.initFn    = initFn;

        this.stateSnapshot = null;
        this.initErr       = null;
    }

    async initialize (testRun, debugging) {
        this.phase = PHASE.pendingInitialization;

        await testRun.switchToCleanRun();

        var navigateCommand = new NavigateToCommand({ url: this.loginPage });

        await testRun.executeCommand(navigateCommand);

        try {
            testRun.debugging = debugging;
            await this.initFn(testRun);
        }
        catch (err) {
            this.initErr = err;
        }

        testRun.previousDebuggingState = testRun.debugging;
        testRun.debugging              = false;

        if (!this.initErr) {
            // NOTE: give Hammerhead time to sync cookies from client
            await delay(COOKIE_SYNC_DELAY);
            this.stateSnapshot = testRun.getStateSnapshot();
        }

        this.phase = PHASE.initialized;
        this.emit('initialized');
    }
}

export function createRole (loginPage, initFn) {
    assertType(is.string, 'Role', '"loginPage" argument', loginPage);
    assertType(is.function, 'Role', '"initFn" argument', initFn);

    loginPage = resolvePageUrl(loginPage);
    initFn    = wrapTestFunction(initFn);

    return new Role(loginPage, initFn);
}

export function createAnonymousRole () {
    return new Role(null, null);
}
