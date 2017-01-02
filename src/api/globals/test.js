import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import TestingUnit from './testing-unit';

export default class Test extends TestingUnit {
    constructor (globals) {
        super(globals);

        this.fixture = globals.currentFixture;

        this.fn = null;

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
}

TestingUnit._makeAPIListForChildClass(Test);
