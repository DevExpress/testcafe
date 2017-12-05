import { sep } from 'path';
import { getCallsiteForError } from './get-callsite';
import { APIError } from './runtime';
import TestCafeErrorList from './error-list';

import {
    UncaughtErrorInTestCode,
    UncaughtNonErrorObjectInTestCode,
    ExternalAssertionLibraryError
} from './test-run';


const INTERNAL = 'internal/';

function isAssertionErrorCallsiteFrame (frame) {
    var filename = frame.getFileName();

    // NOTE: filter out the internals of node.js and assertion libraries
    return filename &&
           filename.indexOf(sep) > -1 &&
           filename.indexOf(INTERNAL) !== 0 &&
           filename.indexOf(`${sep}node_modules${sep}`) < 0;
}


export default function processTestFnError (err) {
    if (err && (err.isTestCafeError || err instanceof TestCafeErrorList))
        return err;

    if (err && err.constructor === APIError)
        return new UncaughtErrorInTestCode(err.rawMessage, err.callsite);

    if (err instanceof Error) {
        var isAssertionError = err.name === 'AssertionError' || err.constructor.name === 'AssertionError';

        // NOTE: assertion libraries can add their source files to the error stack frames.
        // We should skip them to create a correct callsite for the assertion error.
        var callsite = isAssertionError ? getCallsiteForError(err, isAssertionErrorCallsiteFrame) : getCallsiteForError(err);

        return isAssertionError ?
            new ExternalAssertionLibraryError(err, callsite) :
            new UncaughtErrorInTestCode(err, callsite);
    }

    return new UncaughtNonErrorObjectInTestCode(err);
}
