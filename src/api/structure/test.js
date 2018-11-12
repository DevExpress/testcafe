import TestingUnit from './testing-unit';
import { assertType, is } from '../../errors/runtime/type-assertions';
import wrapTestFunction from '../wrap-test-function';
import assertRequestHookType from '../request-hooks/assert-type';
import { flattenDeep as flatten, union } from 'lodash';

export default class Test extends TestingUnit {
    constructor (testFile) {
        super(testFile, 'test');

        this.fixture = testFile.currentFixture;

        this.fn           = null;
        this.beforeFn     = null;
        this.afterFn      = null;
        this.requestHooks = [];

        return this.apiOrigin;
    }

    _add (name, fn) {
        assertType(is.string, 'apiOrigin', 'The test name', name);
        assertType(is.function, 'apiOrigin', 'The test body', fn);
        assertType(is.nonNullObject, 'apiOrigin', `The fixture of '${name}' test`, this.fixture);

        this.name         = name;
        this.fn           = wrapTestFunction(fn);
        this.requestHooks = union(this.requestHooks, Array.from(this.fixture.requestHooks));

        if (this.testFile.collectedTests.indexOf(this) < 0)
            this.testFile.collectedTests.push(this);

        return this.apiOrigin;
    }

    _before$ (fn) {
        assertType(is.function, 'before', 'test.before hook', fn);

        this.beforeFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _after$ (fn) {
        assertType(is.function, 'after', 'test.after hook', fn);

        this.afterFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _requestHooks$ (...hooks) {
        hooks = flatten(hooks);

        assertRequestHookType(hooks);

        this.requestHooks = union(this.requestHooks, hooks);

        return this.apiOrigin;
    }
}

TestingUnit._makeAPIListForChildClass(Test);
