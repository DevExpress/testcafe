import {
    AssertionCommand,
    ContainsAssertionCommand,
    EqlAssertionCommand,
    GtAssertionCommand,
    GteAssertionCommand,
    LtAssertionCommand,
    LteAssertionCommand,
    MatchAssertionCommand,
    NotContainsAssertionCommand,
    NotEqlAssertionCommand,
    NotMatchAssertionCommand,
    NotOkAssertionCommand,
    NotTypeOfAssertionCommand,
    NotWithinAssertionCommand,
    OkAssertionCommand,
    TypeOfAssertionCommand,
    WithinAssertionCommand,
} from '../../test-run/commands/assertion';
import { AssertionWithoutMethodCallError } from '../../errors/test-run';
import TestController from './index';
import { CallsiteRecord } from 'callsite-record';
import { AssertionOptions } from '../../test-run/commands/options';
import { isClientFunction, isSelector } from '../../client-functions/types';
import addWarning from '../../notifications/add-rendered-warning';
import WARNING_MESSAGE from '../../notifications/warning-message';

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

        return this._testController.enqueueCommand(command, {
            assertionType: command.methodName,
            actual:        this._actual,
            expected:      assertionArgs.expected,
            expected2:     assertionArgs.expected2,
            message:       message,
            options:       { timeout: options.timeout, allowUnawaitedPromise: options.allowUnawaitedPromise },
        }, this._checkForWarnings.bind(this));
    }

    private _checkForWarnings (testController: TestController, assertionCommand: AssertionCommand, callsite: CallsiteRecord): void {
        testController.checkForExcessiveAwaits(callsite, assertionCommand);

        if (isClientFunction(assertionCommand.actual)) {
            addWarning(testController.warningLog, {
                message:  WARNING_MESSAGE.assertedClientFunctionInstance,
                actionId: assertionCommand.actionId,
            }, callsite);
        }
        else if (isSelector(assertionCommand.actual)) {
            addWarning(testController.warningLog, {
                message:  WARNING_MESSAGE.assertedSelectorInstance,
                actionId: assertionCommand.actionId,
            }, callsite);
        }
    }

    public [EqlAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(EqlAssertionCommand, { expected, message, opts });
    }

    public [NotEqlAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotEqlAssertionCommand, { expected, message, opts });
    }

    public [OkAssertionCommand.methodName] (message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(OkAssertionCommand, { message, opts });
    }

    public [NotOkAssertionCommand.methodName] (message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotOkAssertionCommand, { message, opts });
    }

    public [ContainsAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(ContainsAssertionCommand, { expected, message, opts });
    }

    public [NotContainsAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotContainsAssertionCommand, { expected, message, opts });
    }

    public [TypeOfAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(TypeOfAssertionCommand, { expected, message, opts });
    }

    public [NotTypeOfAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotTypeOfAssertionCommand, { expected, message, opts });
    }

    public [GtAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(GtAssertionCommand, { expected, message, opts });
    }

    public [GteAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(GteAssertionCommand, { expected, message, opts });
    }

    public [LtAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(LtAssertionCommand, { expected, message, opts });
    }

    public [LteAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(LteAssertionCommand, { expected, message, opts });
    }

    public [WithinAssertionCommand.methodName] (start: number, finish: number, message: string, opts: AssertionOptions): () => Promise<unknown> {
        // NOTE: `within` is not available in Chai `assert` interface.
        return this._enqueueAssertion(WithinAssertionCommand, { expected: start, expected2: finish, message, opts });
    }

    public [NotWithinAssertionCommand.methodName] (start: number, finish: number, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotWithinAssertionCommand, { expected: start, expected2: finish, message, opts });
    }

    public [MatchAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(MatchAssertionCommand, { expected, message, opts });
    }

    public [NotMatchAssertionCommand.methodName] (expected: unknown, message: string, opts: AssertionOptions): () => Promise<unknown> {
        return this._enqueueAssertion(NotMatchAssertionCommand, { expected, message, opts });
    }
}
