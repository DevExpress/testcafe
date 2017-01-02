import { assert, expect } from 'chai';
import { assign } from 'lodash';
import delay from '../utils/delay';
import { ExternalAssertionLibraryError } from '../errors/test-run';
import { assertNonNegativeNumber } from '../errors/runtime/type-assertions';
import ClientFunctionResultPromise from '../client-functions/result-promise';

const ASSERTION_DELAY = 200;

export default class Assertion {
    constructor (actual, testContoller) {
        this.actual         = actual;
        this.testController = testContoller;
        this.message        = void 0;
        this.opts           = {};
    }

    _wrapSelectorResultAssertionExecutor (executor) {
        return async () => {
            var startTime     = new Date();
            var resultPromise = this.actual;
            var passed        = false;
            var timeout       = this.opts.timeout === void 0 ?
                                this.testController.testRun.opts.assertionTimeout :
                                this.opts.timeout;

            while (!passed) {
                this.actual = await resultPromise._reExecute();

                try {
                    executor();
                    passed = true;
                }

                catch (err) {
                    if (new Date() - startTime >= timeout)
                        throw err;

                    await delay(ASSERTION_DELAY);
                }
            }
        };
    }

    _wrapExecutor (callsite, executor) {
        if (this.actual instanceof ClientFunctionResultPromise)
            executor = this._wrapSelectorResultAssertionExecutor(executor);

        return async () => {
            try {
                await executor();
            }

            catch (err) {
                if (err.name === 'AssertionError' || err.constructor.name === 'AssertionError')
                    throw new ExternalAssertionLibraryError(err, callsite);

                if (err.isTestCafeError)
                    err.callsite = callsite;

                throw err;
            }
        };
    }

    _enqueueAssertion (apiMethodName, message, opts, executor) {
        if (typeof message === 'object')
            opts = message;
        else
            this.message = message;

        this.opts = assign(this.opts, opts);

        if (this.opts.timeout !== void 0)
            assertNonNegativeNumber(apiMethodName, '"timeout" option', this.opts.timeout);

        return this.testController._enqueueTask(apiMethodName, callsite => this._wrapExecutor(callsite, executor));
    }

    eql (expected, message, opts) {
        return this._enqueueAssertion('eql', message, opts, () => assert.deepEqual(this.actual, expected, this.message));
    }

    notEql (unexpected, message, opts) {
        return this._enqueueAssertion('notEql', message, opts, () => assert.notDeepEqual(this.actual, unexpected, this.message));
    }

    ok (message, opts) {
        return this._enqueueAssertion('ok', message, opts, () => assert.isOk(this.actual, this.message));
    }

    notOk (message, opts) {
        return this._enqueueAssertion('notOk', message, opts, () => assert.isNotOk(this.actual, this.message));
    }

    contains (what, message, opts) {
        return this._enqueueAssertion('contains', message, opts, () => assert.include(this.actual, what, this.message));
    }

    notContains (what, message, opts) {
        return this._enqueueAssertion('notContains', message, opts, () => assert.notInclude(this.actual, what, this.message));
    }

    typeOf (type, message, opts) {
        return this._enqueueAssertion('typeOf', message, opts, () => assert.typeOf(this.actual, type, this.message));
    }

    notTypeOf (type, message, opts) {
        return this._enqueueAssertion('notTypeOf', message, opts, () => assert.notTypeOf(this.actual, type, this.message));
    }

    gt (expected, message, opts) {
        return this._enqueueAssertion('gt', message, opts, () => assert.isAbove(this.actual, expected, this.message));
    }

    gte (expected, message, opts) {
        return this._enqueueAssertion('gte', message, opts, () => assert.isAtLeast(this.actual, expected, this.message));
    }

    lt (expected, message, opts) {
        return this._enqueueAssertion('lt', message, opts, () => assert.isBelow(this.actual, expected, this.message));
    }

    lte (expected, message, opts) {
        return this._enqueueAssertion('lte', message, opts, () => assert.isAtMost(this.actual, expected, this.message));
    }

    within (lo, hi, message, opts) {
        // NOTE: `within` is not available in Chai `assert` interface.
        return this._enqueueAssertion('within', message, opts, () => expect(this.actual).to.be.within(lo, hi, this.message));
    }

    notWithin (lo, hi, message, opts) {
        return this._enqueueAssertion('notWithin', message, opts, () => expect(this.actual).not.to.be.within(lo, hi, this.message));
    }

    match (re, message, opts) {
        return this._enqueueAssertion('match', message, opts, () => assert.match(this.actual, re, this.message));
    }

    notMatch (re, message, opts) {
        return this._enqueueAssertion('notMatch', message, opts, () => assert.notMatch(this.actual, re, this.message));
    }
}
