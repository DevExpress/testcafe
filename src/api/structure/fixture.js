import { flattenDeep as flatten } from 'lodash';
import { SPECIAL_BLANK_PAGE } from 'testcafe-hammerhead';

import TestingUnit from './testing-unit';
import { FIXTURE as FIXTURE_TYPE } from './unit-types';

import { assertType, is } from '../../errors/runtime/type-assertions';
import handleTagArgs from '../../utils/handle-tag-args';
import wrapTestFunction from '../wrap-test-function';
import assertRequestHookType from '../request-hooks/assert-type';
import assertClientScriptType from '../../custom-client-scripts/assert-type';

import OPTION_NAMES from '../../configuration/option-names';

import { APIError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';


export default class Fixture extends TestingUnit {
    constructor (testFile) {
        super(testFile, FIXTURE_TYPE);

        this.path = testFile.filename;

        this.pageUrl = SPECIAL_BLANK_PAGE;

        this.beforeEachFn = null;
        this.afterEachFn  = null;

        this.beforeFn = null;
        this.afterFn  = null;

        return this.apiOrigin;
    }

    _add (name, ...rest) {
        name = handleTagArgs(name, rest);

        assertType(is.string, 'apiOrigin', 'The fixture name', name);

        this.name                    = name;
        this.testFile.currentFixture = this;

        return this.apiOrigin;
    }

    _before$ (fn) {
        assertType(is.function, 'before', 'fixture.before hook', fn);

        this.beforeFn = fn;

        return this.apiOrigin;
    }

    _after$ (fn) {
        assertType(is.function, 'after', 'fixture.after hook', fn);

        this.afterFn = fn;

        return this.apiOrigin;
    }

    _beforeEach$ (fn) {
        assertType(is.function, 'beforeEach', 'fixture.beforeEach hook', fn);

        this.beforeEachFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _afterEach$ (fn) {
        assertType(is.function, 'afterEach', 'fixture.afterEach hook', fn);

        this.afterEachFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _requestHooks$ (...hooks) {
        if (this.apiMethodWasCalled.requestHooks)
            throw new APIError(OPTION_NAMES.requestHooks, RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.requestHooks);

        hooks = flatten(hooks);

        assertRequestHookType(hooks);

        this.requestHooks = hooks;

        this.apiMethodWasCalled.requestHooks = true;

        return this.apiOrigin;
    }

    _clientScripts$ (...scripts) {
        if (this.apiMethodWasCalled.clientScripts)
            throw new APIError(OPTION_NAMES.clientScripts, RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.clientScripts);

        scripts = flatten(scripts);

        assertClientScriptType(scripts);

        this.clientScripts = scripts;

        this.apiMethodWasCalled.clientScripts = true;

        return this.apiOrigin;
    }
}

TestingUnit._makeAPIListForChildClass(Fixture);
