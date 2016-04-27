import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import wrapTestFunction from './wrap-test-function';

export default class Test {
    constructor (name, fn, fixture) {
        var nameType = typeof name;

        if (nameType !== 'string')
            throw new APIError('test', null, MESSAGE.testNameIsNotAString, nameType);

        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('test', null, MESSAGE.testBodyIsNotAFunction, fnType);

        this.name    = name;
        this.fixture = fixture;
        this.fn      = wrapTestFunction(fn);
    }
}
