import { flattenDeep as flatten, union } from 'lodash';
import TestingUnit from './testing-unit';
import { TEST as TEST_TYPE } from './unit-types';
import { assertType, is } from '../../errors/runtime/type-assertions';
import wrapTestFunction from '../wrap-test-function';
import assertRequestHookType from '../request-hooks/assert-type';
import assertClientScriptType from '../../custom-client-scripts/assert-type';
import { RUNTIME_ERRORS } from '../../errors/types';
import { APIError } from '../../errors/runtime';
import OPTION_NAMES from '../../configuration/option-names';

export default class Test extends TestingUnit {
    constructor (testFile) {
        super(testFile, TEST_TYPE);

        this.fixture = testFile.currentFixture;

        this.fn            = null;
        this.beforeFn      = null;
        this.afterFn       = null;

        if (this.fixture) {
            this.requestHooks  = this.fixture.requestHooks.slice();
            this.clientScripts = this.fixture.clientScripts.slice();
        }

        return this.apiOrigin;
    }

    _add (name, fn) {
        assertType(is.string, 'apiOrigin', 'The test name', name);
        assertType(is.function, 'apiOrigin', 'The test body', fn);
        assertType(is.nonNullObject, 'apiOrigin', `The fixture of '${name}' test`, this.fixture);

        this.name          = name;
        this.fn            = wrapTestFunction(fn);

        if (!this.testFile.collectedTests.includes(this))
            this.testFile.collectedTests.push(this);

        return this.apiOrigin;
    }

    _before$ (fn) {
        assertType(is.function, 'before', 'test.before hook', fn);

        this.beforeFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _after$ (fn) {
        assertType(is.function, 'after', 'test.after hook', fn);

        this.afterFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    _requestHooks$ (...hooks) {
        if (this.apiMethodWasCalled.requestHooks)
            throw new APIError(OPTION_NAMES.requestHooks, RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.requestHooks);

        hooks = flatten(hooks);

        assertRequestHookType(hooks);

        this.requestHooks = union(this.requestHooks, hooks);

        this.apiMethodWasCalled.requestHooks = true;

        return this.apiOrigin;
    }

    _clientScripts$ (...scripts) {
        if (this.apiMethodWasCalled.clientScripts)
            throw new APIError(OPTION_NAMES.clientScripts, RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.clientScripts);

        scripts = flatten(scripts);

        assertClientScriptType(scripts);

        this.clientScripts = union(this.clientScripts, scripts);

        this.apiMethodWasCalled.clientScripts = true;

        return this.apiOrigin;
    }
}

TestingUnit._makeAPIListForChildClass(Test);
