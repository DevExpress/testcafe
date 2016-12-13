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

    httpAuth (username, password, domain, workstation) {
        var userNameType = typeof username;

        if (userNameType !== 'string')
            throw new APIError('httpAuth', MESSAGE.authCredentialIsNotString, 'username', userNameType);
        else if (!username)
            throw new APIError('httpAuth', MESSAGE.authCredentialIsEmpty, 'username');

        var passwordType = typeof password;

        if (passwordType !== 'string')
            throw new APIError('httpAuth', MESSAGE.authCredentialIsNotString, 'password', passwordType);
        else if (!password)
            throw new APIError('httpAuth', MESSAGE.authCredentialIsEmpty, 'password');

        var domainType = typeof domain;

        if (domainType !== 'string' && domainType !== 'undefined')
            throw new APIError('httpAuth', MESSAGE.authCredentialIsNotString, 'domain', domainType);

        var workstationType = typeof workstation;

        if (workstationType !== 'string' && workstationType !== 'undefined')
            throw new APIError('httpAuth', MESSAGE.authCredentialIsNotString, 'workstation', workstationType);

        this.authCredentials = {
            username,
            password,
            domain,
            workstation
        };

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
