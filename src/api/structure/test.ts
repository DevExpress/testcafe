import { flattenDeep as flatten, union } from 'lodash';
import TestingUnit from './testing-unit';
import UnitType from './unit-type';
import { assertType, is } from '../../errors/runtime/type-assertions';
import wrapTestFunction from '../wrap-test-function';
import assertRequestHookType from '../request-hooks/assert-type';
import assertClientScriptType from '../../custom-client-scripts/assert-type';
import { RUNTIME_ERRORS } from '../../errors/types';
import { APIError } from '../../errors/runtime';
import OPTION_NAMES from '../../configuration/option-names';
import TestFile from './test-file';
import Fixture from './fixture';
import RequestHook from '../request-hooks/hook';
import ClientScriptInit from '../../custom-client-scripts/client-script-init';
import { SPECIAL_BLANK_PAGE } from 'testcafe-hammerhead';
import { TestTimeouts } from './interfaces';
import TestTimeout from './test-timeout';
import ESM_RUNTIME_HOLDER_NAME from '../../services/compiler/esm-runtime-holder-name';

interface TestInitOptions {
    testFile: TestFile;
    baseUrl?: string;
    isCompilerServiceMode?: boolean;
}

export default class Test extends TestingUnit {
    public fixture: Fixture | null;
    public fn: Function | null;
    public beforeFn: Function | null;
    public afterFn: Function | null;
    public globalBeforeFn: Function | null;
    public globalAfterFn: Function | null;
    public timeouts: TestTimeouts | null;
    private readonly _isCompilerService: boolean;
    public readonly esmRuntime: string;

    public constructor (testFile: TestFile, isCompilerServiceMode = false, baseUrl?: string, returnApiOrigin = true) {
        // NOTE: 'fixture' directive can be missing
        const fixture = testFile.currentFixture as Fixture;
        const pageUrl = fixture?.pageUrl || SPECIAL_BLANK_PAGE;

        super(testFile, UnitType.test, pageUrl, baseUrl);

        this.fixture        = null;
        this.fn             = null;
        this.beforeFn       = null;
        this.afterFn        = null;
        this.globalBeforeFn = null;
        this.globalAfterFn  = null;
        this.timeouts       = null;

        this._isCompilerService = isCompilerServiceMode;

        this._initFixture(testFile);

        // NOTE: This is internal data of 'esm' module
        // @ts-ignore
        this.esmRuntime = global[ESM_RUNTIME_HOLDER_NAME] || null;

        if (returnApiOrigin)
            return this.apiOrigin as unknown as Test;
    }

    public static init ({ testFile, baseUrl, isCompilerServiceMode }: TestInitOptions): Test {
        return TestingUnit.init(Test, testFile, isCompilerServiceMode, baseUrl) as unknown as Test;
    }

    private _initFixture (testFile: TestFile): void {
        this.fixture = testFile.currentFixture;

        if (!this.fixture)
            return;

        this.pageUrl             = this.fixture.pageUrl || SPECIAL_BLANK_PAGE;
        this.requestHooks        = this.fixture.requestHooks.slice();
        this.clientScripts       = this.fixture.clientScripts.slice();
        this.skipJsErrorsOptions = this.fixture.skipJsErrorsOptions;
    }

    protected _add (name: string, fn: Function): Function {
        if (this._isCompilerService && !this.fixture)
            this._initFixture(this.testFile);

        assertType(is.string, 'apiOrigin', 'The test name', name);
        assertType(is.function, 'apiOrigin', 'The test body', fn);
        assertType(is.nonNullObject, 'apiOrigin', `The fixture of '${name}' test`, this.fixture);

        this.name = name;
        this.fn   = wrapTestFunction(fn);

        if (!this.testFile.collectedTests.includes(this))
            this.testFile.collectedTests.push(this);

        return this.apiOrigin;
    }

    private _before$ (fn: Function): Function {
        assertType(is.function, 'before', 'The test.before hook', fn);

        this.beforeFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    private _after$ (fn: Function): Function {
        assertType(is.function, 'after', 'The test.after hook', fn);

        this.afterFn = wrapTestFunction(fn);

        return this.apiOrigin;
    }

    private _requestHooks$ (...hooks: RequestHook[]): Function {
        if (this.apiMethodWasCalled.requestHooks)
            throw new APIError(OPTION_NAMES.requestHooks, RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.requestHooks);

        hooks = flatten(hooks);

        assertRequestHookType(hooks);

        this.requestHooks                    = union(this.requestHooks, hooks);
        this.apiMethodWasCalled.requestHooks = true;

        return this.apiOrigin;
    }

    private _clientScripts$ (...scripts: ClientScriptInit[]): Function {
        if (this.apiMethodWasCalled.clientScripts)
            throw new APIError(OPTION_NAMES.clientScripts, RUNTIME_ERRORS.multipleAPIMethodCallForbidden, OPTION_NAMES.clientScripts);

        scripts = flatten(scripts);

        assertClientScriptType(scripts);

        this.clientScripts                    = union(this.clientScripts, scripts);
        this.apiMethodWasCalled.clientScripts = true;

        return this.apiOrigin;
    }

    private _timeouts$ (timeouts: TestTimeouts): Function {
        assertType(is.testTimeouts, 'timeouts', 'test.timeouts', timeouts);

        Object.keys(TestTimeout)
            .filter(timeout => timeout in timeouts)
            .forEach(timeout => {
                assertType(is.nonNegativeNumber, 'timeouts', `test.timeouts.${timeout}`, timeouts[timeout as keyof TestTimeouts]);
            });

        this.timeouts = timeouts;

        return this.apiOrigin;
    }
}

TestingUnit.makeAPIListForChildClass(Test);
