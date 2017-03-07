import { isNil as isNullOrUndefined } from 'lodash';
import { assertType, is } from '../../errors/runtime/type-assertions';
import wrapTestFunction from '../wrap-test-function';
import ensureUrlProtocol from '../../utils/ensure-url-protocol';

export default class RoleDescriptor {
    constructor (loginPage, initFn) {
        this.loginPage = null;
        this.initFn    = null;

        this.requireInit = false;
        this.state       = null;
        this.initErr     = null;

        if (!isNullOrUndefined(loginPage) || !isNullOrUndefined(initFn))
            this._assignInitInfo(loginPage, initFn);
    }

    _assignInitInfo (loginPage, initFn) {
        assertType(is.string, 'Role', '"loginPage" argument', loginPage);
        assertType(is.function, 'Role', '"initFn" argument', initFn);

        this.initFn      = wrapTestFunction(initFn);
        this.loginPage   = ensureUrlProtocol(loginPage);
        this.requireInit = true;
    }
}
