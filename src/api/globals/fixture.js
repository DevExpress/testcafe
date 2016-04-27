import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import handleTagArgs from '../../utils/handle-tag-args';
import wrapTestFunction from './wrap-test-function';

const PROTOCOL_RE          = /^https?:\/\//;
const IMPLICIT_PROTOCOL_RE = /^\/\//;

export default class Fixture {
    constructor (name, filename) {
        var nameType = typeof name;

        if (nameType !== 'string')
            throw new APIError('fixture', null, MESSAGE.fixtureNameIsNotAString, nameType);

        this.name         = name;
        this.path         = filename;
        this.pageUrl      = 'about:blank';
        this.beforeEachFn = null;
        this.afterEachFn  = null;
    }

    page (url, ...rest) {
        this.pageUrl = handleTagArgs(url, rest);

        var urlType = typeof this.pageUrl;

        if (urlType !== 'string')
            throw new APIError('page', null, MESSAGE.fixturePageIsNotAString, urlType);

        if (!PROTOCOL_RE.test(this.pageUrl)) {
            var protocol = IMPLICIT_PROTOCOL_RE.test(this.pageUrl) ? 'http:' : 'http://';

            this.pageUrl = protocol + this.pageUrl;
        }

        return this;
    }

    beforeEach (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('beforeEach', null, MESSAGE.beforeEachIsNotAFunction, fnType);

        this.beforeEachFn = wrapTestFunction(fn);

        return this;
    }

    afterEach (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('afterEach', null, MESSAGE.afterEachIsNotAFunction, fnType);

        this.afterEachFn = wrapTestFunction(fn);

        return this;
    }
}
