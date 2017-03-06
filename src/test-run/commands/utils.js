// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
import TYPE from './type';

export function isCommandRejectableByPageError (command) {
    return !isObservationCommand(command) && !isBrowserManipulationCommand(command) && !isServiceCommand(command) ||
           isRejectablePrepareBrowserManipulationCommand(command) && !isWindowSwitchingCommand(command);
}

function isObservationCommand (command) {
    return command.type === TYPE.executeClientFunction ||
           command.type === TYPE.executeSelector ||
           command.type === TYPE.wait ||
           command.type === TYPE.debug;
}

function isWindowSwitchingCommand (command) {
    return command.type === TYPE.switchToIframe || command.type === TYPE.switchToMainWindow;
}

export function isVisualManipulationCommand (command) {
    return command.type === TYPE.click ||
           command.type === TYPE.rightClick ||
           command.type === TYPE.doubleClick ||
           command.type === TYPE.hover ||
           command.type === TYPE.typeText ||
           command.type === TYPE.drag ||
           command.type === TYPE.dragToElement ||
           command.type === TYPE.selectText ||
           command.type === TYPE.selectTextAreaContent ||
           command.type === TYPE.selectEditableContent ||
           command.type === TYPE.pressKey ||
           command.type === TYPE.navigateTo ||
           command.type === TYPE.setFilesToUpload ||
           command.type === TYPE.clearUpload;
}

export function isBrowserManipulationCommand (command) {
    return command.type === TYPE.takeScreenshot ||
           command.type === TYPE.takeScreenshotOnFail ||
           command.type === TYPE.resizeWindow ||
           command.type === TYPE.resizeWindowToFitDevice;
}

function isRejectablePrepareBrowserManipulationCommand (command) {
    return command.type === TYPE.prepareBrowserManipulation &&
           (command.manipulationCommandType === TYPE.resizeWindow ||
            command.manipulationCommandType === TYPE.resizeWindowToFitDevice);
}

function isServicePrepareBrowserManipulationCommand (command) {
    return command.type === TYPE.prepareBrowserManipulation &&
           command.manipulationCommandType === TYPE.takeScreenshotOnFail;
}

export function isServiceCommand (command) {
    return command.type === TYPE.testDone ||
           command.type === TYPE.takeScreenshotOnFail ||
           command.type === TYPE.showAssertionRetriesStatus ||
           command.type === TYPE.hideAssertionRetriesStatus ||
           isServicePrepareBrowserManipulationCommand(command);
}

export function isExecutableInTopWindowOnly (command) {
    return command.type === TYPE.testDone ||
           command.type === TYPE.debug ||
           command.type === TYPE.prepareBrowserManipulation ||
           command.type === TYPE.switchToMainWindow ||
           command.type === TYPE.setNativeDialogHandler ||
           command.type === TYPE.getNativeDialogHistory ||
           command.type === TYPE.setTestSpeed;
}
