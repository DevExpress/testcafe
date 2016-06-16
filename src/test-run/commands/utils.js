import TYPE from './type';

export function isCommandRejectableByPageError (command) {
    return !isObservationCommand(command) && !isWindowManipulationCommand(command) && !isServiceCommand(command);
}

function isObservationCommand (command) {
    return command.type === TYPE.executeClientFunction ||
           command.type === TYPE.executeSelector ||
           command.type === TYPE.wait;
}

export function isWindowManipulationCommand (command) {
    return command.type === TYPE.takeScreenshot ||
           command.type === TYPE.takeScreenshotOnFail ||
           command.type === TYPE.resizeWindow ||
           command.type === TYPE.resizeWindowToFitDevice;
}

export function isServiceCommand (command) {
    return command.type === TYPE.testDone ||
           command.type === TYPE.takeScreenshotOnFail ||
           command.type === TYPE.prepareBrowserManipulation;
}

