import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import wrapTestFunction from './wrap-test-function';
import { getDelegatedAPIList, delegateAPI } from '../../utils/delegated-api';

// NOTE: initialized after class declaration
var apiList = null;

export default class Test {
    constructor (globals) {
        this.globals = globals;
        this.fixture = globals.currentFixture;

        this.name = null;
        this.fn   = null;
        this.only = false;

        var test = this;

        this.apiOrigin = function apiOrigin (...args) {
            return test._add(...args);
        };

        delegateAPI(this, this.apiOrigin, apiList, null, false);

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
        this.fn   = wrapTestFunction(fn);

        if (this.globals.collectedTests.indexOf(this) < 0)
            this.globals.collectedTests.push(this);

        return this.apiOrigin;
    }

    _only$FLAG () {
        this.only = true;

        return this.apiOrigin;
    }
}

apiList = getDelegatedAPIList(Test.prototype);
