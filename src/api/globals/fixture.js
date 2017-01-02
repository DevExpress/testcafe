import { APIError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';
import wrapTestFunction from './wrap-test-function';
import { assertObject, assertString } from '../../errors/runtime/type-assertions';
import handleTagArgs from '../../utils/handle-tag-args';
import { getDelegatedAPIList, delegateAPI } from '../../utils/delegated-api';


const PROTOCOL_RE          = /^https?:\/\//;
const IMPLICIT_PROTOCOL_RE = /^\/\//;

// NOTE: initialized after class declaration
var apiList = null;

export default class Fixture {
    constructor (globals) {
        this.globals = globals;
        this.path    = globals.filename;

        this.name            = null;
        this.pageUrl         = 'about:blank';
        this.beforeEachFn    = null;
        this.afterEachFn     = null;
        this.authCredentials = null;
        this.only            = false;

        var fixture = this;

        this.apiOrigin = function apiOrigin (...args) {
            return fixture._add(...args);
        };

        delegateAPI(this, this.apiOrigin, apiList, null, false);

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

    _only$FLAG () {
        this.only = true;

        return this.apiOrigin;
    }

    _page$ (url, ...rest) {
        this.pageUrl = handleTagArgs(url, rest);

        var urlType = typeof this.pageUrl;

        if (urlType !== 'string')
            throw new APIError('page', MESSAGE.fixturePageIsNotAString, urlType);

        if (!PROTOCOL_RE.test(this.pageUrl)) {
            var protocol = IMPLICIT_PROTOCOL_RE.test(this.pageUrl) ? 'http:' : 'http://';

            this.pageUrl = protocol + this.pageUrl;
        }

        return this.apiOrigin;
    }

    _httpAuth$ (credentials) {
        assertObject('httpAuth', 'credentials', credentials);
        assertString('httpAuth', 'credentials.username', credentials.username);
        assertString('httpAuth', 'credentials.password', credentials.password);

        if (credentials.domain)
            assertString('httpAuth', 'credentials.domain', credentials.domain);
        if (credentials.workstation)
            assertString('httpAuth', 'credentials.workstation', credentials.workstation);

        this.authCredentials = credentials;

        return this.apiOrigin;
    }

    _beforeEach$ (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('beforeEach', MESSAGE.beforeEachIsNotAFunction, fnType);

        this.beforeEachFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _afterEach$ (fn) {
        var fnType = typeof fn;

        if (fnType !== 'function')
            throw new APIError('afterEach', MESSAGE.afterEachIsNotAFunction, fnType);

        this.afterEachFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }
}

apiList = getDelegatedAPIList(Fixture.prototype);
