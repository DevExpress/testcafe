import { flattenDeep as flatten } from 'lodash';
import TestingUnit from './testing-unit';
import UnitType from './unit-type';
import { assertType, is } from '../../errors/runtime/type-assertions';
import handleTagArgs from '../../utils/handle-tag-args';
import wrapTestFunction from '../wrap-test-function';
import assertRequestHookType from '../request-hooks/assert-type';
import assertClientScriptType from '../../custom-client-scripts/assert-type';
import OPTION_NAMES from '../../configuration/option-names';
import { APIError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import TestFile from './test-file';
import RequestHook from '../request-hooks/hook';
import ClientScriptInit from '../../custom-client-scripts/client-script-init';
import { SPECIAL_BLANK_PAGE } from 'testcafe-hammerhead';

export default class Fixture extends TestingUnit {
    public path: string;
    public beforeEachFn: Function | null;
    public afterEachFn: Function | null;
    public beforeFn: Function | null;
    public afterFn: Function | null;

    public constructor (testFile: TestFile) {
        super(testFile, UnitType.fixture, SPECIAL_BLANK_PAGE);

        this.path         = testFile.filename;
        this.beforeEachFn = null;
        this.afterEachFn  = null;
        this.beforeFn     = null;
        this.afterFn      = null;

        return this.apiOrigin as unknown as Fixture;
    }

    protected _add (name: string, ...rest: unknown[]): Function {
        name = handleTagArgs(name, rest);

        assertType(is.string, 'apiOrigin', 'The fixture name', name);

        this.name                    = name;
        this.testFile.currentFixture = this;

        return this.apiOrigin;
    }

    private _before$ (fn: Function): Function {
        assertType(is.function, 'before', 'The fixture.before hook', fn);

        this.beforeFn = fn;

        return this.apiOrigin;
    }

    private _after$ (fn: Function): Function {
        assertType(is.function, 'after', 'The fixture.after hook', fn);

        this.afterFn = fn;

        return this.apiOrigin;
    }

    private _beforeEach$ (fn: Function): Function {
        assertType(is.function, 'beforeEach', 'The fixture.beforeEach hook', fn);

        this.beforeEachFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    private _afterEach$ (fn: Function): Function {
        assertType(is.function, 'afterEach', 'The fixture.afterEach hook', fn);

        this.afterEachFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    private _requestHooks$ (...hooks: RequestHook[]): Function {
        if (this.apiMethodWasCalled.requestHooks)
            throw new APIError(OPTION_NAMES.requestHooks, RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.requestHooks);

        hooks = flatten(hooks);

        assertRequestHookType(hooks);

        this.requestHooks                    = hooks;
        this.apiMethodWasCalled.requestHooks = true;

        return this.apiOrigin;
    }

    private _clientScripts$ (...scripts: ClientScriptInit[]): Function {
        if (this.apiMethodWasCalled.clientScripts)
            throw new APIError(OPTION_NAMES.clientScripts, RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.clientScripts);

        scripts = flatten(scripts);

        assertClientScriptType(scripts);

        this.clientScripts                    = scripts;
        this.apiMethodWasCalled.clientScripts = true;

        return this.apiOrigin;
    }
}

TestingUnit.makeAPIListForChildClass(Fixture);
