import BaseUnit from './base-unit';
import {
    assertPageUrl,
    getUrl,
    prepareBaseUrl,
} from '../test-page-url';
import handleTagArgs from '../../utils/handle-tag-args';
import { delegateAPI, getDelegatedAPIList } from '../../utils/delegated-api';
import { assertType, is } from '../../errors/runtime/type-assertions';
import FlagList from '../../utils/flag-list';
import OPTION_NAMES from '../../configuration/option-names';
import UnitType from './unit-type';
import RequestHook from '../request-hooks/hook';
import ClientScriptInit from '../../custom-client-scripts/client-script-init';
import TestFile from './test-file';
import { AuthCredentials, Metadata } from './interfaces';
import {
    Dictionary, SkipJsErrorsCallback, SkipJsErrorsCallbackWithOptionsObject,
} from '../../configuration/interfaces';
import { dirname } from 'path';
import { validateSkipJsErrorsOptionValue } from '../../utils/get-options/skip-js-errors';
import { SkipJsErrorsArgumentApiError } from '../../errors/runtime';

export default abstract class TestingUnit extends BaseUnit {
    public readonly testFile: TestFile;
    public name: string | null;
    public pageUrl: string;
    public baseUrl: string | undefined;
    public authCredentials: null | AuthCredentials;
    public meta: Metadata;
    public only: boolean;
    public skip: boolean;
    public requestHooks: RequestHook[];
    public clientScripts: ClientScriptInit[];
    public disablePageReloads: boolean | undefined;
    public disablePageCaching: boolean;
    public apiMethodWasCalled: FlagList;
    public apiOrigin: Function;
    public skipJsErrorsOptions?: boolean | SkipJsErrorsOptionsObject | SkipJsErrorsCallback| SkipJsErrorsCallbackWithOptionsObject;

    protected constructor (testFile: TestFile, unitType: UnitType, pageUrl: string, baseUrl?: string) {
        super(unitType);

        this.testFile = testFile;

        this.name            = null;
        this.pageUrl         = pageUrl;
        this.baseUrl         = baseUrl;
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

        this.apiOrigin = function apiOrigin (...args: unknown[]) {
            return unit._add(...args);
        };

        //@ts-ignore
        delegateAPI(this.apiOrigin, this.constructor.API_LIST, { handler: this });
    }

    protected abstract _add (...args: unknown[]): unknown;

    private _only$getter (): Function {
        this.only = true;

        return this.apiOrigin;
    }

    private _skip$getter (): Function {
        this.skip = true;

        return this.apiOrigin;
    }

    private _disablePageReloads$getter (): Function {
        this.disablePageReloads = true;

        return this.apiOrigin;
    }

    private _enablePageReloads$getter (): Function {
        this.disablePageReloads = false;

        return this.apiOrigin;
    }

    private _page$ (url: string, ...rest: unknown[]): Function {
        this.pageUrl = handleTagArgs(url, rest);
        this.baseUrl = this.baseUrl || dirname(this.testFile.filename);

        const base = prepareBaseUrl(this.baseUrl);

        assertType(is.string, 'page', 'The page URL', this.pageUrl);
        assertPageUrl(this.pageUrl, 'page');

        this.pageUrl = getUrl(this.pageUrl, base);

        return this.apiOrigin;
    }

    private _skipJsErrors$ (options: boolean | SkipJsErrorsOptionsObject | SkipJsErrorsCallback | SkipJsErrorsCallbackWithOptionsObject = true): Function {
        assertType([ is.boolean, is.nonNullObject, is.function ], 'skipJsErrors', 'The skipJsErrors options argument', options);

        this.skipJsErrorsOptions = options;

        validateSkipJsErrorsOptionValue(this.skipJsErrorsOptions, SkipJsErrorsArgumentApiError);

        return this.apiOrigin;
    }

    private _httpAuth$ (credentials: AuthCredentials): Function {
        assertType(is.nonNullObject, 'httpAuth', 'The credentials', credentials);
        assertType(is.string, 'httpAuth', 'credentials.username', credentials.username);
        assertType(is.string, 'httpAuth', 'credentials.password', credentials.password);

        if (credentials.domain)
            assertType(is.string, 'httpAuth', 'credentials.domain', credentials.domain);
        if (credentials.workstation)
            assertType(is.string, 'httpAuth', 'credentials.workstation', credentials.workstation);

        this.authCredentials = credentials;

        return this.apiOrigin;
    }

    private _meta$ (key: string | Dictionary<string>, value?: string): Function {
        assertType([is.string, is.nonNullObject], 'meta', `${this.unitType}.meta`, key);

        const data = typeof key === 'string' ? { [key]: value as string } : key as Dictionary<string>;

        Object.keys(data).forEach(propName => {
            this.meta[propName] = data[propName];
        });

        return this.apiOrigin;
    }

    private _disablePageCaching$getter (): Function {
        this.disablePageCaching = true;

        return this.apiOrigin;
    }

    public static makeAPIListForChildClass (ChildClass: unknown): void {
        //@ts-ignore
        ChildClass.API_LIST = TestingUnit.API_LIST.concat(getDelegatedAPIList(ChildClass.prototype));
    }

    public static init (ChildClass: unknown, ...initProps: unknown[]): TestingUnit {
        const fn = (...args: unknown[]) : unknown => {
            //@ts-ignore
            const apiOrigin = new ChildClass(...initProps) as unknown as Function;

            return apiOrigin(...args);
        };

        const getHandler = (): unknown => {
            //@ts-ignore
            return new ChildClass(...initProps, false);
        };

        //@ts-ignore
        delegateAPI(fn, ChildClass.API_LIST, { getHandler });

        return fn as unknown as TestingUnit;
    }
}

// @ts-ignore
TestingUnit.API_LIST = getDelegatedAPIList(TestingUnit.prototype);


