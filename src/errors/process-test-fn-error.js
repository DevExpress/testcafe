import { sep } from 'path';
import { getCallsiteForError } from './get-callsite';
import { APIError } from './runtime';
import TestCafeErrorList from './error-list';
import INTERNAL_MODULES_PREFIX from './internal-modules-prefix';
import NODE_MODULES from '../shared/node-modules-folder-name';

import {
    UncaughtErrorInTestCode,
    UncaughtNonErrorObjectInTestCode,
    ExternalAssertionLibraryError
} from './test-run';

function isAssertionErrorCallsiteFrame (frame) {
    const filename = frame.getFileName();

    // NOTE: filter out the internals of node.js and assertion libraries
    return filename &&
        filename.includes(sep) &&
        !filename.startsWith(INTERNAL_MODULES_PREFIX) &&
        !filename.includes(`${sep}${NODE_MODULES}${sep}`);
}

export default function processTestFnError (err) {
    if (err && (err.isTestCafeError || err instanceof TestCafeErrorList))
        return err;

    if (err && err instanceof APIError)
        return new UncaughtErrorInTestCode(err);

    if (err instanceof Error) {
        const isAssertionError = err.name === 'AssertionError' || err.constructor.name === 'AssertionError';

        // NOTE: assertion libraries can add their source files to the error stack frames.
        // We should skip them to create a correct callsite for the assertion error.
        const callsite = isAssertionError ? getCallsiteForError(err, isAssertionErrorCallsiteFrame) : getCallsiteForError(err);

        return isAssertionError ?
            new ExternalAssertionLibraryError(err, callsite) :
            new UncaughtErrorInTestCode(err, callsite);
    }

    return new UncaughtNonErrorObjectInTestCode(err);
}
