import getCallsite from './get-callsite';
import { APIError } from './runtime';

import {
    UncaughtErrorInTestCode,
    UncaughtNonErrorObjectInTestCode,
    ExternalAssertionLibraryError
} from './test-run';


export default function processTestFnError (err) {
    if (err && err.isTestCafeError)
        return err;

    if (err && err.constructor === APIError)
        return new UncaughtErrorInTestCode(err.rawMessage, err.callsite);

    if (err instanceof Error) {
        var callsite         = getCallsite(err);
        var isAssertionError = err.name === 'AssertionError' || err.constructor.name === 'AssertionError';

        return isAssertionError ?
               new ExternalAssertionLibraryError(err, callsite) :
               new UncaughtErrorInTestCode(err, callsite);
    }

    return new UncaughtNonErrorObjectInTestCode(err);
}
