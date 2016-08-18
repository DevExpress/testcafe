import { getViewportSize } from 'testcafe-browser-natives';
import { isServiceCommand } from './commands/utils';
import COMMAND_TYPE from './commands/type';
import WARNING_MESSAGE from '../warnings/message';

export default class BrowserManipulationQueue {
    constructor (browserConnection, screenshotCapturer, warningLog) {
        this.commands           = [];
        this.browserId          = browserConnection.id;
        this.browserProvider    = browserConnection.provider;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog         = warningLog;
    }

    async _resizeWindow (width, height, currentWidth, currentHeight) {
        try {
            return await this.browserProvider.resizeWindow(this.browserId, width, height, currentWidth, currentHeight);
        }
        catch (err) {
            this.warningLog.addWarning(WARNING_MESSAGE.resizeError, err.message);
            return null;
        }
    }

    async _resizeWindowToFitDevice (device, portrait, currentWidth, currentHeight) {
        var { landscapeWidth, portraitWidth } = getViewportSize(device);
        var width  = portrait ? portraitWidth : landscapeWidth;
        var height = portrait ? landscapeWidth : portraitWidth;

        return await this._resizeWindow(width, height, currentWidth, currentHeight);
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
        var command = this.commands.shift();

        switch (command.type) {
            case COMMAND_TYPE.takeScreenshot:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureAction({
                    customPath: command.path,
                    pageWidth:  driverMsg.innerWidth,
                    pageHeight: driverMsg.innerHeight
                }));

            case COMMAND_TYPE.takeScreenshotOnFail:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureError({
                    screenshotRequired: true,
                    pageWidth:          driverMsg.innerWidth,
                    pageHeight:         driverMsg.innerHeight
                }));

            case COMMAND_TYPE.resizeWindow:
                return await this._resizeWindow(command.width, command.height, driverMsg.innerWidth, driverMsg.innerHeight);

            case COMMAND_TYPE.resizeWindowToFitDevice:
                return await this._resizeWindowToFitDevice(command.device, command.options.portraitOrientation, driverMsg.innerWidth, driverMsg.innerHeight);
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
