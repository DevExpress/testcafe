import { assertType, is } from '../errors/runtime/type-assertions';
import wrapTestFunction from '../api/wrap-test-function';
import { getUrl, assertRoleUrl } from '../api/test-page-url';
import Role from './role';

interface RoleOptions {
    preserveUrl?: boolean;
}

export function createRole (loginUrl: string, initFn: Function, options: RoleOptions = { preserveUrl: false }): Role {
    assertType(is.string, 'Role', 'The "loginUrl" argument', loginUrl);
    assertType(is.function, 'Role', 'The "initFn" argument', initFn);
    assertType(is.nonNullObject, 'Role', 'The "options" argument', options);

    if (options.preserveUrl !== void 0)
        assertType(is.boolean, 'Role', 'The "preserveUrl" option', options.preserveUrl);

    assertRoleUrl(loginUrl, 'Role');

    loginUrl = getUrl(loginUrl);
    initFn   = wrapTestFunction(initFn);

    return new Role(loginUrl, initFn, options);
}

export function createAnonymousRole (): Role {
    return new Role(null, null);
}
