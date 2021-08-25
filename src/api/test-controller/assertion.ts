import {
    AssertionCommand,
    Contains,
    Eql,
    Gt,
    Gte,
    Lt,
    Lte,
    Match,
    NotContains,
    NotEql,
    NotMatch,
    NotOk,
    NotTypeOf,
    NotWithin,
    Ok,
    TypeOf,
    Within,
} from '../../test-run/commands/assertion';
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

    private _enqueueAssertion (command: typeof AssertionCommand, assertionArgs: AssertionArgs): () => Promise<unknown> {
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

        return this._testController._enqueueCommand(command, {
            assertionType: command.methodName,
            actual:        this._actual,
            expected:      assertionArgs.expected,
            expected2:     assertionArgs.expected2,
            message:       message,
            options:       { timeout: options.timeout, allowUnawaitedPromise: options.allowUnawaitedPromise },
        });
    }

    public [Eql.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(Eql, { expected, message, opts });
    }

    public [NotEql.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotEql, { expected, message, opts });
    }

    public [Ok.methodName] (message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(Ok, { message, opts });
    }

    public [NotOk.methodName] (message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotOk, { message, opts });
    }

    public [Contains.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(Contains, { expected, message, opts });
    }

    public [NotContains.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotContains, { expected, message, opts });
    }

    public [TypeOf.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(TypeOf, { expected, message, opts });
    }

    public [NotTypeOf.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotTypeOf, { expected, message, opts });
    }

    public [Gt.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(Gt, { expected, message, opts });
    }

    public [Gte.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(Gte, { expected, message, opts });
    }

    public [Lt.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(Lt, { expected, message, opts });
    }

    public [Lte.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(Lte, { expected, message, opts });
    }

    public [Within.methodName] (start: number, finish: number, message: string, opts: AssertionOptions): () => Promise<unknown> {
        // NOTE: `within` is not available in Chai `assert` interface.
        return this._enqueueAssertion(Within, { expected: start, expected2: finish, message, opts });
    }

    public [NotWithin.methodName] (start: number, finish: number, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotWithin, { expected: start, expected2: finish, message, opts });
    }

    public [Match.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(Match, { expected, message, opts });
    }

    public [NotMatch.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotMatch, { expected, message, opts });
    }
}
