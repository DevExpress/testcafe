import { sep } from 'path';
import { getCallsiteForError } from './get-callsite';
import { APIError } from './runtime';
import TestCafeErrorList from './error-list';
import INTERNAL_MODULES_PREFIX from './internal-modules-prefix';
import NODE_MODULES from '../utils/node-modules-folder-name';

import {
    UncaughtErrorInTestCode,
    UncaughtNonErrorObjectInTestCode,
    ExternalAssertionLibraryError,
    UncaughtExceptionError,
} from './test-run';
import debug from 'debug';
import isFileProtocol from '../shared/utils/is-file-protocol';

const debugLog = debug('testcafe:errors');


function isAssertionErrorCallsiteFrame (frame) {
    const filename = frame.getFileName();

    // NOTE: filter out the internals of node.js and assertion libraries
    return filename &&
        (filename.includes(sep) || isFileProtocol(filename)) &&
        !filename.startsWith(INTERNAL_MODULES_PREFIX) &&
        !filename.includes(`${sep}${NODE_MODULES}${sep}`);
}

export default function processTestFnError (err) {
    debugLog('processTestFnError: %O', err);

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

    if (err && err.isInternalError)
        return new UncaughtExceptionError(err.stack);

    return new UncaughtNonErrorObjectInTestCode(err);
}
