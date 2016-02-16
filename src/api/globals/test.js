import { GlobalsAPIError } from '../../errors';
import MESSAGE from '../../errors/message';

export default class Test {
    constructor (name, fn, fixture) {
        var nameType = typeof name;

        if (nameType !== 'string')
            throw new GlobalsAPIError('test', null, MESSAGE.testNameIsNotAString, nameType);

        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new GlobalsAPIError('test', null, MESSAGE.testBodyIsNotAFunction, fnType);

        this.name    = name;
        this.fn      = fn;
        this.fixture = fixture;
    }
}
