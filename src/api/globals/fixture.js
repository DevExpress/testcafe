import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import handleTagArgs from '../../utils/handle-tag-args';
import wrapTestFunction from './wrap-test-function';
import { assertObject, assertString } from '../../errors/runtime/type-assertions';

const PROTOCOL_RE          = /^https?:\/\//;
const IMPLICIT_PROTOCOL_RE = /^\/\//;

export default class Fixture {
    constructor (name, filename) {
        var nameType = typeof name;

        if (nameType !== 'string')
            throw new APIError('fixture', MESSAGE.fixtureNameIsNotAString, nameType);

        this.name            = name;
        this.path            = filename;
        this.pageUrl         = 'about:blank';
        this.beforeEachFn    = null;
        this.afterEachFn     = null;
        this.authCredentials = null;
    }

    page (url, ...rest) {
        this.pageUrl = handleTagArgs(url, rest);

        var urlType = typeof this.pageUrl;

        if (urlType !== 'string')
            throw new APIError('page', MESSAGE.fixturePageIsNotAString, urlType);

        if (!PROTOCOL_RE.test(this.pageUrl)) {
            var protocol = IMPLICIT_PROTOCOL_RE.test(this.pageUrl) ? 'http:' : 'http://';

            this.pageUrl = protocol + this.pageUrl;
        }

        return this;
    }

    httpAuth (credentials) {
        assertObject('httpAuth', 'credentials', credentials);
        assertString('httpAuth', 'credentials.username', credentials.username);
        assertString('httpAuth', 'credentials.password', credentials.password);

        if (credentials.domain)
            assertString('httpAuth', 'credentials.domain', credentials.domain);
        if (credentials.workstation)
            assertString('httpAuth', 'credentials.workstation', credentials.workstation);

        this.authCredentials = credentials;

        return this;
    }

    beforeEach (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('beforeEach', MESSAGE.beforeEachIsNotAFunction, fnType);

        this.beforeEachFn = wrapTestFunction(fn);

        return this;
    }

    afterEach (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('afterEach', MESSAGE.afterEachIsNotAFunction, fnType);

        this.afterEachFn = wrapTestFunction(fn);

        return this;
    }
}
