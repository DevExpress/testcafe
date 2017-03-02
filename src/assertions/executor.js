import { assert, expect } from 'chai';
import { EventEmitter } from 'events';
import delay from '../utils/delay';
import { ExternalAssertionLibraryError } from '../errors/test-run';
import ClientFunctionResultPromise from '../client-functions/result-promise';

const ASSERTION_DELAY = 200;

export default class AssertionExecutor extends EventEmitter {
    constructor (command, callsite) {
        super();

        this.command  = command;
        this.callsite = callsite;

        this.startTime = null;
        this.passed    = false;
        this.inRetry   = false;

        var executor = AssertionExecutor._getExecutor(this.command);

        this.executor = this.command.actual instanceof ClientFunctionResultPromise ?
                        this._wrapExecutor(executor) : executor;
    }

    static _getExecutor (command) {
        switch (command.assertionType) {
            case 'eql':
                return () => assert.deepEqual(command.actual, command.expected, command.message);

            case 'notEql':
                return () => assert.notDeepEqual(command.actual, command.expected, command.message);

            case 'ok':
                return () => assert.isOk(command.actual, command.message);

            case 'notOk':
                return () => assert.isNotOk(command.actual, command.message);

            case 'contains':
                return () => assert.include(command.actual, command.expected, command.message);

            case 'notContains':
                return () => assert.notInclude(command.actual, command.expected, command.message);

            case 'typeOf':
                return () => assert.typeOf(command.actual, command.expected, command.message);

            case 'notTypeOf':
                return () => assert.notTypeOf(command.actual, command.expected, command.message);

            case 'gt':
                return () => assert.isAbove(command.actual, command.expected, command.message);

            case 'gte':
                return () => assert.isAtLeast(command.actual, command.expected, command.message);

            case 'lt':
                return () => assert.isBelow(command.actual, command.expected, command.message);

            case 'lte':
                return () => assert.isAtMost(command.actual, command.expected, command.message);

            case 'within':
                return () => expect(command.actual).to.be.within(command.expected, command.expected2, command.message);

            case 'notWithin':
                return () => expect(command.actual).not.to.be.within(command.expected, command.expected2, command.message);

            case 'match':
                return () => assert.match(command.actual, command.expected, command.message);

            case 'notMatch':
                return () => assert.notMatch(command.actual, command.expected, command.message);

            default:
                return () => {
                };
        }
    }

    _getTimeLeft () {
        return this.command.options.timeout - (new Date() - this.startTime);
    }

    _onExecutionFinished () {
        if (this.inRetry)
            this.emit('end-assertion-retries', this.passed);
    }

    _wrapExecutor (executor) {
        return async () => {
            var resultPromise = this.command.actual;

            while (!this.passed) {
                this.command.actual = await resultPromise._reExecute();

                try {
                    executor();
                    this.passed = true;
                    this._onExecutionFinished();
                }

                catch (err) {
                    if (this._getTimeLeft() <= 0) {
                        this._onExecutionFinished();
                        throw err;
                    }

                    await delay(ASSERTION_DELAY);

                    this.inRetry = true;
                    this.emit('start-assertion-retries', this._getTimeLeft());
                }
            }
        };
    }

    async run () {
        this.startTime = new Date();

        try {
            await this.executor();
        }

        catch (err) {
            if (err.name === 'AssertionError' || err.constructor.name === 'AssertionError')
                throw new ExternalAssertionLibraryError(err, this.callsite);

            if (err.isTestCafeError)
                err.callsite = this.callsite;

            throw err;
        }
    }
}
