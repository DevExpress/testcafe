// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import TYPE from './type';

const RAW_API_JS_EXPRESSION_TYPE = 'js-expr';

export function isCommandRejectableByPageError (command) {
    return !isObservationCommand(command) && !isBrowserManipulationCommand(command) && !isServiceCommand(command) ||
           isResizeWindowCommand(command)
           && !isWindowSwitchingCommand(command);
}

function isClientFunctionCommand (command) {
    return command.type === TYPE.executeClientFunction ||
           command.type === TYPE.executeSelector;
}

export function isObservationCommand (command) {
    return isClientFunctionCommand(command) ||
           command.type === TYPE.wait ||
           command.type === TYPE.assertion ||
           command.type === TYPE.executeExpression;
}

function isWindowSwitchingCommand (command) {
    return command.type === TYPE.switchToIframe || command.type === TYPE.switchToMainWindow;
}

export function canSetDebuggerBreakpointBeforeCommand (command) {
    return command.type !== TYPE.debug && !isClientFunctionCommand(command) && !isServiceCommand(command);
}

export function isScreenshotCommand (command) {
    return command.type === TYPE.takeScreenshot ||
           command.type === TYPE.takeElementScreenshot ||
           command.type === TYPE.takeScreenshotOnFail;
}

export function isResizeWindowCommand (command) {
    return command.type === TYPE.resizeWindow ||
           command.type === TYPE.resizeWindowToFitDevice ||
           command.type === TYPE.maximizeWindow;
}

export function isBrowserManipulationCommand (command) {
    return isScreenshotCommand(command) || isResizeWindowCommand(command);
}

export function isServiceCommand (command) {
    return command.type === TYPE.testDone ||
           command.type === TYPE.showAssertionRetriesStatus ||
           command.type === TYPE.hideAssertionRetriesStatus ||
           command.type === TYPE.setBreakpoint ||
           command.type === TYPE.takeScreenshotOnFail ||
           command.type === TYPE.recorder;
}

export function isExecutableInTopWindowOnly (command) {
    return command.type === TYPE.testDone ||
           command.type === TYPE.switchToMainWindow ||
           command.type === TYPE.setNativeDialogHandler ||
           command.type === TYPE.getNativeDialogHistory ||
           command.type === TYPE.setTestSpeed ||
           command.type === TYPE.showAssertionRetriesStatus ||
           command.type === TYPE.hideAssertionRetriesStatus ||
           command.type === TYPE.setBreakpoint ||
           isBrowserManipulationCommand(command) && command.type !== TYPE.takeElementScreenshot;
}

export function isJSExpression (val) {
    return val !== null && typeof val === 'object' && val.type === RAW_API_JS_EXPRESSION_TYPE &&
           typeof val.value === 'string';
}

export function isExecutableOnClientCommand (command) {
    return command.type !== TYPE.wait &&
           command.type !== TYPE.setPageLoadTimeout &&
           command.type !== TYPE.debug &&
           command.type !== TYPE.useRole &&
           command.type !== TYPE.assertion &&
           command.type !== TYPE.executeExpression &&
           command.type !== TYPE.executeAsyncExpression;
}
