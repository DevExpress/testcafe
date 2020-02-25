import BaseUnit from './base-unit';
import { assertUrl, resolvePageUrl } from '../test-page-url';
import handleTagArgs from '../../utils/handle-tag-args';
import { delegateAPI, getDelegatedAPIList } from '../../utils/delegated-api';
import { assertType, is } from '../../errors/runtime/type-assertions';
import FlagList from '../../utils/flag-list';
import OPTION_NAMES from '../../configuration/option-names';


export default class TestingUnit extends BaseUnit {
    constructor (testFile, unitTypeName) {
        super(unitTypeName);

        this.testFile = testFile;

        this.name            = null;
        this.pageUrl         = null;
        this.authCredentials = null;
        this.meta            = {};
        this.only            = false;
        this.skip            = false;
        this.requestHooks    = [];
        this.clientScripts   = [];

        this.disablePageReloads = void 0;
        this.disablePageCaching = false;

        this.apiMethodWasCalled = new FlagList([OPTION_NAMES.clientScripts, OPTION_NAMES.requestHooks]);

        const unit = this;

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

    _disablePageReloads$getter () {
        this.disablePageReloads = true;

        return this.apiOrigin;
    }

    _enablePageReloads$getter () {
        this.disablePageReloads = false;

        return this.apiOrigin;
    }

    _page$ (url, ...rest) {
        this.pageUrl = handleTagArgs(url, rest);

        assertType(is.string, 'page', 'The page URL', this.pageUrl);

        assertUrl(this.pageUrl, 'page');

        this.pageUrl = resolvePageUrl(this.pageUrl, this.testFile.filename);

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

    _meta$ (...args) {
        assertType([is.string, is.nonNullObject], 'meta', `${this.unitTypeName}.meta`, args[0]);

        const data = typeof args[0] === 'string' ? { [args[0]]: args[1] } : args[0];

        Object.keys(data).forEach(key => {
            this.meta[key] = data[key];
        });

        return this.apiOrigin;
    }

    _disablePageCaching$getter () {
        this.disablePageCaching = true;

        return this.apiOrigin;
    }

    static _makeAPIListForChildClass (ChildClass) {
        ChildClass.API_LIST = TestingUnit.API_LIST.concat(getDelegatedAPIList(ChildClass.prototype));
    }
}

TestingUnit.API_LIST = getDelegatedAPIList(TestingUnit.prototype);


