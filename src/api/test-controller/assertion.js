import AssertionCommand from '../../test-run/commands/assertion';

export default class Assertion {
    constructor (actual, testController) {
        this.testController = testController;
        this.actual         = actual;
    }

    _enqueueAssertion (apiMethodName, assertionArgs) {
        var options = assertionArgs.opts || {};
        var message = assertionArgs.message;

        if (typeof message === 'object') {
            options = assertionArgs.message;
            message = void 0;
        }

        return this.testController._enqueueCommand(apiMethodName, AssertionCommand, {
            assertionType: apiMethodName,
            actual:        this.actual,
            expected:      assertionArgs.expected,
            expected2:     assertionArgs.expected2,
            message:       message,
            options:       { timeout: options.timeout, allowUnawaitedPromise: options.allowUnawaitedPromise }
        });
    }

    eql (expected, message, opts) {
        return this._enqueueAssertion('eql', { expected, message, opts });
    }

    notEql (expected, message, opts) {
        return this._enqueueAssertion('notEql', { expected, message, opts });
    }

    ok (message, opts) {
        return this._enqueueAssertion('ok', { message, opts });
    }

    notOk (message, opts) {
        return this._enqueueAssertion('notOk', { message, opts });
    }

    contains (expected, message, opts) {
        return this._enqueueAssertion('contains', { expected, message, opts });
    }

    notContains (expected, message, opts) {
        return this._enqueueAssertion('notContains', { expected, message, opts });
    }

    typeOf (expected, message, opts) {
        return this._enqueueAssertion('typeOf', { expected, message, opts });
    }

    notTypeOf (expected, message, opts) {
        return this._enqueueAssertion('notTypeOf', { expected, message, opts });
    }

    gt (expected, message, opts) {
        return this._enqueueAssertion('gt', { expected, message, opts });
    }

    gte (expected, message, opts) {
        return this._enqueueAssertion('gte', { expected, message, opts });
    }

    lt (expected, message, opts) {
        return this._enqueueAssertion('lt', { expected, message, opts });
    }

    lte (expected, message, opts) {
        return this._enqueueAssertion('lte', { expected, message, opts });
    }

    within (start, finish, message, opts) {
        // NOTE: `within` is not available in Chai `assert` interface.
        return this._enqueueAssertion('within', { expected: start, expected2: finish, message, opts });
    }

    notWithin (start, finish, message, opts) {
        return this._enqueueAssertion('notWithin', { expected: start, expected2: finish, message, opts });
    }

    match (expected, message, opts) {
        return this._enqueueAssertion('match', { expected, message, opts });
    }

    notMatch (expected, message, opts) {
        return this._enqueueAssertion('notMatch', { expected, message, opts });
    }
}
