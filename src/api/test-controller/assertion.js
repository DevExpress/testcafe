import AssertionCommand from '../../test-run/commands/assertion';
import ASSERTION_TYPE from '../../assertions/type';
import { AssertionWithoutMethodCallError } from '../../errors/test-run';

export default class Assertion {
    constructor (actual, testController, callsite) {
        this.testController = testController;
        this.actual         = actual;
        this.callsite       = callsite;
    }

    then () {
        throw new AssertionWithoutMethodCallError(this.callsite);
    }

    _enqueueAssertion (apiMethodName, assertionArgs) {
        let options = assertionArgs.opts || {};
        let message = assertionArgs.message;

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
        return this._enqueueAssertion(ASSERTION_TYPE.eql, { expected, message, opts });
    }

    notEql (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.notEql, { expected, message, opts });
    }

    ok (message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.ok, { message, opts });
    }

    notOk (message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.notOk, { message, opts });
    }

    contains (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.contains, { expected, message, opts });
    }

    notContains (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.notContains, { expected, message, opts });
    }

    typeOf (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.typeOf, { expected, message, opts });
    }

    notTypeOf (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.notTypeOf, { expected, message, opts });
    }

    gt (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.gt, { expected, message, opts });
    }

    gte (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.gte, { expected, message, opts });
    }

    lt (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.lt, { expected, message, opts });
    }

    lte (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.lte, { expected, message, opts });
    }

    within (start, finish, message, opts) {
        // NOTE: `within` is not available in Chai `assert` interface.
        return this._enqueueAssertion(ASSERTION_TYPE.within, { expected: start, expected2: finish, message, opts });
    }

    notWithin (start, finish, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.notWithin, { expected: start, expected2: finish, message, opts });
    }

    match (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.match, { expected, message, opts });
    }

    notMatch (expected, message, opts) {
        return this._enqueueAssertion(ASSERTION_TYPE.notMatch, { expected, message, opts });
    }
}
