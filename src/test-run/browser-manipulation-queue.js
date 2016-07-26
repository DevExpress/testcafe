import shortId from 'shortid';
import OS from 'os-family';
import { resize as resizeWindow, getViewportSize } from 'testcafe-browser-natives';
import { isServiceCommand } from './commands/utils';
import COMMAND_TYPE from './commands/type';
import WARNING_MESSAGE from '../warnings/message';

export default class BrowserManipulationQueue {
    constructor (windowId, screenshotCapturer, warningLog) {
        this.commands           = [];
        this.windowId           = windowId;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog         = warningLog;
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

    async _takeScreenshot (capture) {
        if (!this.screenshotCapturer.enabled) {
            this.warningLog.addWarning(WARNING_MESSAGE.screenshotsPathNotSpecified);
            return null;
        }

        try {
            return await capture();
        }
        catch (err) {
            this.warningLog.addWarning(WARNING_MESSAGE.screenshotError, err.message);
            return null;
        }
    }

    async executePendingManipulation (driverMsg) {
        // TODO: remove once https://github.com/DevExpress/testcafe-browser-natives/issues/12 implemented
        if (OS.linux) {
            this.warningLog.addWarning(WARNING_MESSAGE.browserManipulationsNotSupportedOnLinux);
            return null;
        }

        var command = this.commands.shift();

        switch (command.type) {
            case COMMAND_TYPE.takeScreenshot:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureAction(this.windowId, {
                    stepName:   shortId.generate(),
                    customPath: command.path
                }));

            case COMMAND_TYPE.takeScreenshotOnFail:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureError(this.windowId, {
                    stepName:           shortId.generate(),
                    screenshotRequired: true
                }));

            case COMMAND_TYPE.resizeWindow:
                return await this._resizeWindow(driverMsg.currentWidth, driverMsg.currentHeight, command.width, command.height);

            case COMMAND_TYPE.resizeWindowToFitDevice:
                return await this._resizeWindowToFitDevice(driverMsg.currentWidth, driverMsg.currentHeight, command.device, command.options.portraitOrientation);
        }

        return null;
    }

    push (command) {
        this.commands.push(command);
    }

    removeAllNonServiceManipulations () {
        this.commands = this.commands.filter(command => isServiceCommand(command));
    }
}
