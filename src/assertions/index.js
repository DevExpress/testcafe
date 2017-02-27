import { assert, expect } from 'chai';
import { EventEmitter } from 'events';
import delay from '../utils/delay';
import { ExternalAssertionLibraryError } from '../errors/test-run';
import ClientFunctionResultPromise from '../client-functions/result-promise';

const ASSERTION_DELAY = 200;

export default class Assertions extends EventEmitter {
    constructor () {
        super();
    }

    _wrapSelectorResultAssertionExecutor (command, executor) {
        return async () => {
            var startTime     = new Date();
            var elapsedTime   = null;
            var resultPromise = command.actual;
            var passed        = false;
            var reexecuted    = false;

            while (!passed) {
                command.actual = await resultPromise._reExecute();

                try {
                    executor();
                    passed = true;
                }

                catch (err) {
                    if (new Date() - startTime >= command.options.timeout) {
                        if (reexecuted)
                            this.emit('end-assertion-execution', false);
                        throw err;
                    }

                    await delay(ASSERTION_DELAY);

                    if (!reexecuted) {
                        reexecuted  = true;
                        elapsedTime = command.options.timeout - (new Date() - startTime);
                        this.emit('start-assertion-execution', elapsedTime);
                    }
                }
            }

            if (reexecuted)
                this.emit('end-assertion-execution', true);
        };
    }

    _getExecutor (command) {
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

    createExecutor (command, callsite) {
        var executor = this._getExecutor(command);

        if (command.actual instanceof ClientFunctionResultPromise)
            executor = this._wrapSelectorResultAssertionExecutor(command, executor);

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
}
