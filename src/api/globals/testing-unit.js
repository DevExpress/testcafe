import handleTagArgs from '../../utils/handle-tag-args';
import { delegateAPI, getDelegatedAPIList } from '../../utils/delegated-api';
import { assertType, is } from '../../errors/runtime/type-assertions';
import TestController from '../test-controller';
import testRunTracker from '../test-run-tracker';
import processTestFnError from '../../errors/process-test-fn-error';

const PROTOCOL_RE          = /^(https?|file):\/\//;
const IMPLICIT_PROTOCOL_RE = /^\/\//;

export default class TestingUnit {
    constructor (globals) {
        this.globals = globals;

        this.name            = null;
        this.pageUrl         = null;
        this.authCredentials = null;
        this.only            = false;
        this.skip            = false;

        var unit = this;

        this.apiOrigin = function apiOrigin (...args) {
            return unit._add(...args);
        };

        delegateAPI(this.apiOrigin, this.constructor.API_LIST, { handler: this });
    }

    _add () {
        throw new Error('Not implemented');
    }

    _only$getter () {
        this.only = true;

        return this.apiOrigin;
    }

    _skip$getter () {
        this.skip = true;

        return this.apiOrigin;
    }

    _page$ (url, ...rest) {
        this.pageUrl = handleTagArgs(url, rest);

        assertType(is.string, 'page', 'The page URL', this.pageUrl);

        if (!PROTOCOL_RE.test(this.pageUrl)) {
            var protocol = IMPLICIT_PROTOCOL_RE.test(this.pageUrl) ? 'http:' : 'http://';

            this.pageUrl = protocol + this.pageUrl;
        }

        return this.apiOrigin;
    }

    _httpAuth$ (credentials) {
        assertType(is.nonNullObject, 'httpAuth', 'credentials', credentials);
        assertType(is.string, 'httpAuth', 'credentials.username', credentials.username);
        assertType(is.string, 'httpAuth', 'credentials.password', credentials.password);

        if (credentials.domain)
            assertType(is.string, 'httpAuth', 'credentials.domain', credentials.domain);
        if (credentials.workstation)
            assertType(is.string, 'httpAuth', 'credentials.workstation', credentials.workstation);

        this.authCredentials = credentials;

        return this.apiOrigin;
    }

    static _wrapTestFunction (fn) {
        return async testRun => {
            var result     = null;
            var markeredfn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

            testRun.controller = new TestController(testRun);

            testRunTracker.ensureEnabled();

            try {
                result = await markeredfn(testRun.controller);
            }
            catch (err) {
                throw processTestFnError(err);
            }

            // NOTE: check if the last command in the test
            // function is missing the `await` keyword.
            testRun.controller._checkForMissingAwait();

            return result;
        };
    }

    static _makeAPIListForChildClass (ChildClass) {
        ChildClass.API_LIST = TestingUnit.API_LIST.concat(getDelegatedAPIList(ChildClass.prototype));
    }
}

TestingUnit.API_LIST = getDelegatedAPIList(TestingUnit.prototype);


