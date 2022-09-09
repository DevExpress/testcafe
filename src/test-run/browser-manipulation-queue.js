import { getViewportSize } from 'device-specs';
import { isServiceCommand } from './commands/utils';
import COMMAND_TYPE from './commands/type';
import WARNING_MESSAGE from '../notifications/warning-message';
import { WindowDimensionsOverflowError } from '../errors/test-run/';

export default class BrowserManipulationQueue {
    constructor (browserConnection, screenshotCapturer, warningLog) {
        this.commands           = [];
        this.browserId          = browserConnection.id;
        this.browserProvider    = browserConnection.provider;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog         = warningLog;
    }

    async _resizeWindow (width, height, currentWidth, currentHeight) {
        const canResizeWindow = await this.browserProvider.canResizeWindowToDimensions(this.browserId, width, height);

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
        const { landscapeWidth, portraitWidth } = getViewportSize(device);

        const width  = portrait ? portraitWidth : landscapeWidth;
        const height = portrait ? landscapeWidth : portraitWidth;

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
        return capture();
    }

    async _executeCommand (driverMsg) {
        const command = this.commands.shift();

        switch (command.type) {
            case COMMAND_TYPE.takeElementScreenshot:
            case COMMAND_TYPE.takeScreenshot:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureAction({
                    actionId:       command.actionId,
                    customPath:     command.path,
                    pageDimensions: driverMsg.pageDimensions,
                    cropDimensions: driverMsg.cropDimensions,
                    markSeed:       command.markSeed,
                    fullPage:       command.fullPage,
                    thumbnails:     command.thumbnails,
                }));

            case COMMAND_TYPE.takeScreenshotOnFail:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureError({
                    actionId:       command.actionId,
                    failedActionId: command.failedActionId,
                    pageDimensions: driverMsg.pageDimensions,
                    markSeed:       command.markSeed,
                    fullPage:       command.fullPage,
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

    async executePendingManipulation (driverMsg, messageBus) {
        const command = this.commands[0];

        const handleBrowserManipulationWarning = warning => {
            warning.actionId = warning.actionId || command.actionId;
        };

        messageBus.on('before-warning-add', handleBrowserManipulationWarning);

        const result = await this._executeCommand(driverMsg);

        messageBus.off('before-warning-add', handleBrowserManipulationWarning);

        return result;
    }

    push (command) {
        this.commands.push(command);
    }

    removeAllNonServiceManipulations () {
        this.commands = this.commands.filter(command => isServiceCommand(command));
    }
}
