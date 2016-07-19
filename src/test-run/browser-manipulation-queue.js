import shortId from 'shortid';
import { resize as resizeWindow, getViewportSize } from 'testcafe-browser-natives';
import SCREENSHOTS_WARNING_MESSAGES from '../runner/screenshots/warning-messages';
import { isServiceCommand } from './commands/utils';
import COMMAND_TYPE from './commands/type';


export default class BrowserManipulationQueue {
    constructor (windowId, screenshotCapturer) {
        this.commands           = [];
        this.windowId           = windowId;
        this.screenshotCapturer = screenshotCapturer;
    }

    async _resizeWindow (currentWidth, currentHeight, width, height) {
        return await resizeWindow(this.windowId, currentWidth, currentHeight, width, height);
    }

    async _resizeWindowToFitDevice (currentWidth, currentHeight, device, portrait) {
        var { landscapeWidth, portraitWidth } = getViewportSize(device);
        var width  = portrait ? portraitWidth : landscapeWidth;
        var height = portrait ? landscapeWidth : portraitWidth;

        return await resizeWindow(this.windowId, currentWidth, currentHeight, width, height);
    }

    async _takeScreenshot (customPath) {
        try {
            return await this.screenshotCapturer.captureAction(this.windowId, {
                stepName:   shortId.generate(),
                customPath: customPath
            });
        }
        catch (e) {
            // NOTE: swallow the error silently if we can't take screenshots for some
            // reason (e.g. we don't have permissions to write a screenshot file).
            return null;
        }
    }

    async _takeScreenshotOnFail () {
        if (!this.screenshotCapturer.enabled)
            return SCREENSHOTS_WARNING_MESSAGES.screenshotDirNotSet;

        try {
            return await this.screenshotCapturer.captureError(this.windowId, {
                stepName:           shortId.generate(),
                screenshotRequired: true
            });
        }
        catch (e) {
            return SCREENSHOTS_WARNING_MESSAGES.cannotCreate;
        }
    }

    push (command) {
        this.commands.push(command);
    }

    removeAllNonServiceManipulations () {
        this.commands = this.commands.filter(command => isServiceCommand(command));
    }

    async executePendingManipulation (driverMsg) {
        var command = this.commands.shift();

        switch (command.type) {
            case COMMAND_TYPE.takeScreenshot:
                return await this._takeScreenshot(command.path);

            case COMMAND_TYPE.takeScreenshotOnFail:
                return await this._takeScreenshotOnFail();

            case COMMAND_TYPE.resizeWindow:
                return await this._resizeWindow(driverMsg.currentWidth, driverMsg.currentHeight, command.width, command.height);

            case COMMAND_TYPE.resizeWindowToFitDevice:
                return await this._resizeWindowToFitDevice(driverMsg.currentWidth, driverMsg.currentHeight, command.device, command.options.portraitOrientation);
        }

        return null;
    }
}
