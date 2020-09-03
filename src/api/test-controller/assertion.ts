import AssertionCommand from '../../test-run/commands/assertion';
import ASSERTION_TYPE from '../../assertions/type';
import { AssertionWithoutMethodCallError } from '../../errors/test-run';
import TestController from './index';
import { CallsiteRecord } from 'callsite-record';
import { AssertionOptions } from '../../test-run/commands/options';

interface AssertionArgs {
    opts: AssertionOptions;
    message?: string | AssertionOptions;
    expected?: unknown;
    expected2?: unknown;
}

export default class Assertion {
    private readonly _testController: TestController;
    private readonly _actual: unknown;
    private readonly _callsite: CallsiteRecord;

    public constructor (actual: unknown, testController: TestController, callsite: CallsiteRecord) {
        this._testController = testController;
        this._actual         = actual;
        this._callsite       = callsite;
    }

    public then (): never {
        throw new AssertionWithoutMethodCallError(this._callsite);
    }

    private _enqueueAssertion (apiMethodName: string, assertionArgs: AssertionArgs): () => Promise<unknown> {
        let options = assertionArgs.opts || {};
        let message = assertionArgs.message;

        // NOTE: Assertion options should be specified after the 'message' parameter.
        // await t.expect(42).eql(43, 'wrong value', { timeout: 10000 });
        // In case of empty assertion message we allowing to specify assertion option in place of assertion message.
        // await t.expect(42).eql(43, { timeout: 10000 });
        if (typeof message === 'object') {
            options = assertionArgs.message as AssertionOptions;
            message = void 0;
        }

        return this._testController._enqueueCommand(apiMethodName, AssertionCommand, {
            assertionType: apiMethodName,
            actual:        this._actual,
            expected:      assertionArgs.expected,
            expected2:     assertionArgs.expected2,
            message:       message,
            options:       { timeout: options.timeout, allowUnawaitedPromise: options.allowUnawaitedPromise }
        });
    }

    public eql (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.eql, { expected, message, opts });
    }

    public notEql (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.notEql, { expected, message, opts });
    }

    public ok (message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.ok, { message, opts });
    }

    public notOk (message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.notOk, { message, opts });
    }

    public contains (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.contains, { expected, message, opts });
    }

    public notContains (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.notContains, { expected, message, opts });
    }

    public typeOf (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.typeOf, { expected, message, opts });
    }

    public notTypeOf (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.notTypeOf, { expected, message, opts });
    }

    public gt (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.gt, { expected, message, opts });
    }

    public gte (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.gte, { expected, message, opts });
    }

    public lt (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.lt, { expected, message, opts });
    }

    public lte (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.lte, { expected, message, opts });
    }

    public within (start: number, finish: number, message: string, opts: AssertionOptions): () => Promise<unknown> {
        // NOTE: `within` is not available in Chai `assert` interface.
        return this._enqueueAssertion(ASSERTION_TYPE.within, { expected: start, expected2: finish, message, opts });
    }

    public notWithin (start: number, finish: number, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.notWithin, { expected: start, expected2: finish, message, opts });
    }

    public match (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.match, { expected, message, opts });
    }

    public notMatch (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ASSERTION_TYPE.notMatch, { expected, message, opts });
    }
}
