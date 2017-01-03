import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import handleTagArgs from '../../utils/handle-tag-args';
import TestingUnit from './testing-unit';

export default class Fixture extends TestingUnit {
    constructor (globals) {
        super(globals);

        this.path = globals.filename;

        this.pageUrl = 'about:blank';

        this.beforeEachFn    = null;
        this.afterEachFn     = null;

        return this.apiOrigin;
    }

    _add (name, ...rest) {
        name = handleTagArgs(name, rest);

        var nameType = typeof name;

        if (nameType !== 'string')
            throw new APIError('apiOrigin', MESSAGE.fixtureNameIsNotAString, nameType);

        this.name                   = name;
        this.globals.currentFixture = this;

        return this.apiOrigin;
    }

    _beforeEach$ (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('beforeEach', MESSAGE.beforeEachIsNotAFunction, fnType);

        this.beforeEachFn = TestingUnit._wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _afterEach$ (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('afterEach', MESSAGE.afterEachIsNotAFunction, fnType);

        this.afterEachFn = TestingUnit._wrapTestFunction(fn);

        return this.apiOrigin;
    }
}

TestingUnit._makeAPIListForChildClass(Fixture);
