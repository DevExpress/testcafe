import { EventEmitter } from 'events';
import shortId from 'shortid';
import PHASE from './phase';
import { assertType, is } from '../errors/runtime/type-assertions';
import wrapTestFunction from '../api/wrap-test-function';
import ensureUrlProtocol from '../utils/ensure-url-protocol';
import { NavigateToCommand } from '../test-run/commands/actions';
import roleMarker from './marker-symbol';

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

    async initialize (testRun) {
        this.phase = PHASE.pendingInitialization;

        await testRun.switchToCleanRun();

        var navigateCommand = new NavigateToCommand({ url: this.loginPage });

        await testRun.executeCommand(navigateCommand);

        try {
            await this.initFn(testRun);
        }
        catch (err) {
            this.initErr = err;
        }

        if (!this.initErr)
            this.stateSnapshot = testRun.getStateSnapshot();

        this.phase = PHASE.initialized;
        this.emit('initialized');
    }
}

export function createRole (loginPage, initFn) {
    assertType(is.string, 'Role', '"loginPage" argument', loginPage);
    assertType(is.function, 'Role', '"initFn" argument', initFn);

    loginPage = ensureUrlProtocol(loginPage);
    initFn    = wrapTestFunction(initFn);

    return new Role(loginPage, initFn);
}

export function createAnonymousRole () {
    return new Role(null, null);
}
