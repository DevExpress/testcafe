'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

exports.isCommandRejectableByPageError = isCommandRejectableByPageError;
exports.canSetDebuggerBreakpointBeforeCommand = canSetDebuggerBreakpointBeforeCommand;
exports.isScreenshotCommand = isScreenshotCommand;
exports.isBrowserManipulationCommand = isBrowserManipulationCommand;
exports.isServiceCommand = isServiceCommand;
exports.isExecutableInTopWindowOnly = isExecutableInTopWindowOnly;
exports.isJSExpression = isJSExpression;

var _type = require('./type');

var _type2 = _interopRequireDefault(_type);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RAW_API_JS_EXPRESSION_TYPE = 'js-expr'; // -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
function isCommandRejectableByPageError(command) {
    return !isObservationCommand(command) && !isBrowserManipulationCommand(command) && !isServiceCommand(command) || isRejectableBrowserManipulationCommand(command) && !isWindowSwitchingCommand(command);
}

function isClientFunctionCommand(command) {
    return command.type === _type2.default.executeClientFunction || command.type === _type2.default.executeSelector;
}

function isObservationCommand(command) {
    return isClientFunctionCommand(command) || command.type === _type2.default.wait || command.type === _type2.default.assertion;
}

function isWindowSwitchingCommand(command) {
    return command.type === _type2.default.switchToIframe || command.type === _type2.default.switchToMainWindow;
}

function canSetDebuggerBreakpointBeforeCommand(command) {
    return command.type !== _type2.default.debug && !isClientFunctionCommand(command) && !isServiceCommand(command);
}

function isScreenshotCommand(command) {
    return command.type === _type2.default.takeScreenshot || command.type === _type2.default.takeElementScreenshot || command.type === _type2.default.takeScreenshotOnFail;
}

function isBrowserManipulationCommand(command) {
    return command.type === _type2.default.takeScreenshot || command.type === _type2.default.takeElementScreenshot || command.type === _type2.default.takeScreenshotOnFail || command.type === _type2.default.resizeWindow || command.type === _type2.default.resizeWindowToFitDevice || command.type === _type2.default.maximizeWindow;
}

function isRejectableBrowserManipulationCommand(command) {
    return command.type === _type2.default.resizeWindow || command.type === _type2.default.resizeWindowToFitDevice || command.type === _type2.default.maximizeWindow;
}

function isServiceCommand(command) {
    return command.type === _type2.default.testDone || command.type === _type2.default.takeScreenshotOnFail || command.type === _type2.default.showAssertionRetriesStatus || command.type === _type2.default.hideAssertionRetriesStatus || command.type === _type2.default.setBreakpoint || command.type === _type2.default.takeScreenshotOnFail;
}

function isExecutableInTopWindowOnly(command) {
    return command.type === _type2.default.testDone || command.type === _type2.default.switchToMainWindow || command.type === _type2.default.setNativeDialogHandler || command.type === _type2.default.getNativeDialogHistory || command.type === _type2.default.setTestSpeed || command.type === _type2.default.showAssertionRetriesStatus || command.type === _type2.default.hideAssertionRetriesStatus || command.type === _type2.default.setBreakpoint || isBrowserManipulationCommand(command) && command.type !== _type2.default.takeElementScreenshot;
}

function isJSExpression(val) {
    return val !== null && (typeof val === 'undefined' ? 'undefined' : (0, _typeof3.default)(val)) === 'object' && val.type === RAW_API_JS_EXPRESSION_TYPE && typeof val.value === 'string';
}