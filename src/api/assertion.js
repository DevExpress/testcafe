import { assert, expect } from 'chai';
import Promise from 'pinkie';
import { ExternalAssertionLibraryError } from '../errors/test-run';

export default class Assertion {
    constructor (actual, testContoller) {
        this.actual         = actual;
        this.testController = testContoller;
    }

    static _wrapExecutor (callsite, executor) {
        return () => {
            return Promise
                .resolve()
                .then(() => {
                    try {
                        executor();
                    }

                    catch (err) {
                        throw new ExternalAssertionLibraryError(err, callsite);
                    }
                });
        };
    }

    _enqueueAssertion (apiMethodName, executor) {
        return this.testController._enqueueTask(apiMethodName, callsite => Assertion._wrapExecutor(callsite, executor));
    }

    eql (expected, message) {
        return this._enqueueAssertion('eql', () => assert.deepEqual(this.actual, expected, message));
    }

    notEql (unexpected, message) {
        return this._enqueueAssertion('notEql', () => assert.notDeepEqual(this.actual, unexpected, message));
    }

    ok (message) {
        return this._enqueueAssertion('ok', () => assert.isOk(this.actual, message));
    }

    notOk (message) {
        return this._enqueueAssertion('notOk', () => assert.isNotOk(this.actual, message));
    }

    contains (what, message) {
        return this._enqueueAssertion('contains', () => assert.include(this.actual, what, message));
    }

    notContains (what, message) {
        return this._enqueueAssertion('notContains', () => assert.notInclude(this.actual, what, message));
    }

    typeOf (type, message) {
        return this._enqueueAssertion('typeOf', () => assert.typeOf(this.actual, type, message));
    }

    notTypeOf (type, message) {
        return this._enqueueAssertion('notTypeOf', () => assert.notTypeOf(this.actual, type, message));
    }

    gt (expected, message) {
        return this._enqueueAssertion('gt', () => assert.isAbove(this.actual, expected, message));
    }

    gte (expected, message) {
        return this._enqueueAssertion('gte', () => assert.isAtLeast(this.actual, expected, message));
    }

    lt (expected, message) {
        return this._enqueueAssertion('lt', () => assert.isBelow(this.actual, expected, message));
    }

    lte (expected, message) {
        return this._enqueueAssertion('lte', () => assert.isAtMost(this.actual, expected, message));
    }

    within (lo, hi, message) {
        // NOTE: `within` is not available in Chai `assert` interface.
        return this._enqueueAssertion('within', () => expect(this.actual).to.be.within(lo, hi, message));
    }

    notWithin (lo, hi, message) {
        return this._enqueueAssertion('notWithin', () => expect(this.actual).not.to.be.within(lo, hi, message));
    }
}
