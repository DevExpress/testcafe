import { assertType, is } from '../errors/runtime/type-assertions';
import wrapTestFunction from '../api/wrap-test-function';
import { getUrl, assertRoleUrl } from '../api/test-page-url';
import Role from './role';

interface RoleOptions {
    preserveUrl?: boolean;
}

export function createRole (loginUrl: string, initFn: Function, options: RoleOptions = { preserveUrl: false }): Role {
    assertType(is.string, 'Role', '"loginUrl" argument', loginUrl);
    assertType(is.function, 'Role', '"initFn" argument', initFn);
    assertType(is.nonNullObject, 'Role', '"options" argument', options);

    if (options.preserveUrl !== void 0)
        assertType(is.boolean, 'Role', '"preserveUrl" option', options.preserveUrl);

    assertRoleUrl(loginUrl, 'Role');

    loginUrl = getUrl(loginUrl);
    initFn   = wrapTestFunction(initFn);

    return new Role(loginUrl, initFn, options);
}

export function createAnonymousRole (): Role {
    return new Role(null, null);
}
