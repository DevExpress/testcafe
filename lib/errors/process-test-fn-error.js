'use strict';

exports.__esModule = true;
exports.default = processTestFnError;

var _path = require('path');

var _getCallsite = require('./get-callsite');

var _runtime = require('./runtime');

var _errorList = require('./error-list');

var _errorList2 = _interopRequireDefault(_errorList);

var _testRun = require('./test-run');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INTERNAL = 'internal/';

function isAssertionErrorCallsiteFrame(frame) {
    var filename = frame.getFileName();

    // NOTE: filter out the internals of node.js and assertion libraries
    return filename && filename.indexOf(_path.sep) > -1 && filename.indexOf(INTERNAL) !== 0 && filename.indexOf(_path.sep + 'node_modules' + _path.sep) < 0;
}

function processTestFnError(err) {
    if (err && (err.isTestCafeError || err instanceof _errorList2.default)) return err;

    if (err && err.constructor === _runtime.APIError) return new _testRun.UncaughtErrorInTestCode(err.rawMessage, err.callsite);

    if (err instanceof Error) {
        var isAssertionError = err.name === 'AssertionError' || err.constructor.name === 'AssertionError';

        // NOTE: assertion libraries can add their source files to the error stack frames.
        // We should skip them to create a correct callsite for the assertion error.
        var callsite = isAssertionError ? (0, _getCallsite.getCallsiteForError)(err, isAssertionErrorCallsiteFrame) : (0, _getCallsite.getCallsiteForError)(err);

        return isAssertionError ? new _testRun.ExternalAssertionLibraryError(err, callsite) : new _testRun.UncaughtErrorInTestCode(err, callsite);
    }

    return new _testRun.UncaughtNonErrorObjectInTestCode(err);
}
module.exports = exports['default'];