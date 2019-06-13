import { assertType, is } from '../errors/runtime/type-assertions';
import wrapTestFunction from './wrap-test-function';

export function createRole (loginPage, initFn, options = {}) {
    assertType(is.string, 'Role', '"loginPage" argument', loginPage);
    assertType(is.function, 'Role', '"initFn" argument', initFn);
    assertType(is.nonNullObject, 'Role', '"options" argument', options);

    if (options.preserveUrl !== void 0)
        assertType(is.boolean, 'Role', '"preserveUrl" option', options.preserveUrl);

    return { id: require('nanoid')(), loginPage, initFn: wrapTestFunction(initFn), options };
}

export function createAnonymousRole () {
    return { id: require('nanoid')(), loginPage: null, initFn: null };
}
