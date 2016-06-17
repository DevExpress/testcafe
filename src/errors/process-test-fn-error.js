import { sep } from 'path';
import { escapeRegExp as escapeRe } from 'lodash';
import getCallsite from './get-callsite';
import { APIError } from './runtime';

import {
    UncaughtErrorInTestCode,
    UncaughtNonErrorObjectInTestCode,
    ExternalAssertionLibraryError
} from './test-run';


function isAssertionErrorCallsiteFrame (frame) {
    var filename = frame.getFileName();

    return !new RegExp(`${escapeRe(sep)}node_modules${escapeRe(sep)}`).test(filename);
}


export default function processTestFnError (err) {
    if (err && err.isTestCafeError)
        return err;

    if (err && err.constructor === APIError)
        return new UncaughtErrorInTestCode(err.rawMessage, err.callsite);

    if (err instanceof Error) {
        var isAssertionError = err.name === 'AssertionError' || err.constructor.name === 'AssertionError';

        // NOTE: external assertion libraries can add their source files to the error stack
        // frames. We should skip them to create a correct callsite for the assertion error.
        var callsite = isAssertionError ? getCallsite(err, isAssertionErrorCallsiteFrame) : getCallsite(err);

        return isAssertionError ?
               new ExternalAssertionLibraryError(err, callsite) :
               new UncaughtErrorInTestCode(err, callsite);
    }

    return new UncaughtNonErrorObjectInTestCode(err);
}
