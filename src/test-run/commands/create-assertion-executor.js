import { assert, expect } from 'chai';
import delay from '../../utils/delay';
import { ExternalAssertionLibraryError } from '../../errors/test-run';
import ClientFunctionResultPromise from '../../client-functions/result-promise';

const ASSERTION_DELAY = 200;

function wrapSelectorResultAssertionExecutor (command, executor) {
    return async () => {
        var startTime     = new Date();
        var resultPromise = command.actual;
        var passed        = false;

        while (!passed) {
            command.actual = await resultPromise._reExecute();

            try {
                executor();
                passed = true;
            }

            catch (err) {
                if (new Date() - startTime >= command.options.timeout)
                    throw err;

                await delay(ASSERTION_DELAY);
            }
        }
    };
}

function wrapExecutor (command, callsite, executor) {
    if (command.actual instanceof ClientFunctionResultPromise)
        executor = wrapSelectorResultAssertionExecutor(command, executor);

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

export default function createAssertionExecutor (command, callsite) {
    var method = null;

    switch (command.assertionType) {
        case 'eql':
            method = () => assert.deepEqual(command.actual, command.expected, command.message);
            break;

        case 'notEql':
            method = () => assert.notDeepEqual(command.actual, command.expected, command.message);
            break;

        case 'ok':
            method = () => assert.isOk(command.actual, command.message);
            break;

        case 'notOk':
            method = () => assert.isNotOk(command.actual, command.message);
            break;

        case 'contains':
            method = () => assert.include(command.actual, command.expected, command.message);
            break;

        case 'notContains':
            method = () => assert.notInclude(command.actual, command.expected, command.message);
            break;

        case 'typeOf':
            method = () => assert.typeOf(command.actual, command.expected, command.message);
            break;

        case 'notTypeOf':
            method = () => assert.notTypeOf(command.actual, command.expected, command.message);
            break;

        case 'gt':
            method = () => assert.isAbove(command.actual, command.expected, command.message);
            break;

        case 'gte':
            method = () => assert.isAtLeast(command.actual, command.expected, command.message);
            break;

        case 'lt':
            method = () => assert.isBelow(command.actual, command.expected, command.message);
            break;

        case 'lte':
            method = () => assert.isAtMost(command.actual, command.expected, command.message);
            break;

        case 'within':
            method = () => expect(command.actual).to.be.within(command.expected, command.expected2, command.message);
            break;

        case 'notWithin':
            method = () => expect(command.actual).not.to.be.within(command.expected, command.expected2, command.message);
            break;

        case 'match':
            method = () => assert.match(command.actual, command.expected, command.message);
            break;

        case 'notMatch':
            method = () => assert.notMatch(command.actual, command.expected, command.message);
            break;
    }

    return wrapExecutor(command, callsite, method);
}
