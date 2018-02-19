import { getViewportSize } from 'testcafe-browser-tools';
import { isServiceCommand } from './commands/utils';
import COMMAND_TYPE from './commands/type';
import WARNING_MESSAGE from '../notifications/warning-message';
import { WindowDimensionsOverflowError } from '../errors/test-run/';
import ERROR_TYPE from '../errors/test-run/type';


export default class BrowserManipulationQueue {
    constructor (browserConnection, screenshotCapturer, warningLog) {
        this.commands           = [];
        this.browserId          = browserConnection.id;
        this.browserProvider    = browserConnection.provider;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog         = warningLog;
    }

    async _resizeWindow (width, height, currentWidth, currentHeight) {
        var canResizeWindow = await this.browserProvider.canResizeWindowToDimensions(this.browserId, width, height);

        if (!canResizeWindow)
            throw new WindowDimensionsOverflowError();

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

    async _maximizeWindow () {
        try {
            return await this.browserProvider.maximizeWindow(this.browserId);
        }
        catch (err) {
            this.warningLog.addWarning(WARNING_MESSAGE.maximizeError, err.message);
            return null;
        }
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
            if (err.type === ERROR_TYPE.invalidElementScreenshotDimensionsError)
                throw err;

            this.warningLog.addWarning(WARNING_MESSAGE.screenshotError, err.stack);
            return null;
        }
    }

    async executePendingManipulation (driverMsg) {
        var command = this.commands.shift();

        switch (command.type) {
            case COMMAND_TYPE.takeElementScreenshot:
            case COMMAND_TYPE.takeScreenshot:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureAction({
                    customPath:     command.path,
                    pageDimensions: driverMsg.pageDimensions,
                    cropDimensions: driverMsg.cropDimensions,
                    markSeed:       command.markSeed
                }));

            case COMMAND_TYPE.takeScreenshotOnFail:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureError({
                    pageDimensions: driverMsg.pageDimensions,
                    markSeed:       command.markSeed
                }));

            case COMMAND_TYPE.resizeWindow:
                return await this._resizeWindow(command.width, command.height, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight);

            case COMMAND_TYPE.resizeWindowToFitDevice:
                return await this._resizeWindowToFitDevice(command.device, command.options.portraitOrientation, driverMsg.pageDimensions.innerWidth, driverMsg.pageDimensions.innerHeight);

            case COMMAND_TYPE.maximizeWindow:
                return await this._maximizeWindow();
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
