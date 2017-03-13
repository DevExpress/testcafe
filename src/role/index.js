import { EventEmitter } from 'events';
import shortId from 'shortid';
import PHASE from './phase';
import { assertType, is } from '../errors/runtime/type-assertions';
import wrapTestFunction from '../api/wrap-test-function';
import ensureUrlProtocol from '../utils/ensure-url-protocol';

class Role extends EventEmitter {
    constructor (loginPage, initFn) {
        super();

        this.id = shortId.generate();

        this.loginPage = loginPage;
        this.initFn    = initFn;

        this.phase = loginPage ? PHASE.uninitialized : PHASE.initialized;

        this.stateSnapshot = null;
        this.initErr       = null;
    }

    async getStateSnapshot () {

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
