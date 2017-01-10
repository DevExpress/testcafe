import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import TestingUnit from './testing-unit';
import { assertFunction } from '../../errors/runtime/type-assertions';

export default class Test extends TestingUnit {
    constructor (globals) {
        super(globals);

        this.fixture = globals.currentFixture;

        this.fn       = null;
        this.beforeFn = null;
        this.afterFn  = null;

        return this.apiOrigin;
    }

    _add (name, fn) {
        var nameType = typeof name;

        if (nameType !== 'string')
            throw new APIError('apiOrigin', MESSAGE.testNameIsNotAString, nameType);

        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('apiOrigin', MESSAGE.testBodyIsNotAFunction, fnType);

        this.name = name;
        this.fn   = TestingUnit._wrapTestFunction(fn);

        if (this.globals.collectedTests.indexOf(this) < 0)
            this.globals.collectedTests.push(this);

        return this.apiOrigin;
    }

    _before$ (fn) {
        assertFunction('before', 'test.before hook', fn);

        this.beforeFn = TestingUnit._wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _after$ (fn) {
        assertFunction('after', 'test.after hook', fn);

        this.afterFn = TestingUnit._wrapTestFunction(fn);

        return this.apiOrigin;
    }
}

TestingUnit._makeAPIListForChildClass(Test);
