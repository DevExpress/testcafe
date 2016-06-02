import shortId from 'shortid';
import { getViewportSize, generateThumbnail } from 'testcafe-browser-natives';
import { isServiceCommand } from './commands/utils';
import COMMAND_TYPE from './commands/type';
import WARNING_MESSAGE from '../warnings/message';

export default class BrowserManipulationQueue {
    constructor (browserConnection, screenshotCapturer, warningLog) {
        this.commands           = [];
        this.windowId           = browserConnection.id;
        this.browserProvider    = browserConnection.provider;
        this.screenshotCapturer = screenshotCapturer;
        this.warningLog         = warningLog;
    }


    async _resizeWindow (pageInfo, width, height) {
        try {
            return await this.browserProvider.resizeWindow(this.windowId, pageInfo, width, height);
        }
        catch (err) {
            this.warningLog.addWarning(WARNING_MESSAGE.resizeError, err.message);
            return null;
        }
    }

    async _resizeWindowToFitDevice (pageInfo, device, portrait) {
        var { landscapeWidth, portraitWidth } = getViewportSize(device);
        var width  = portrait ? portraitWidth : landscapeWidth;
        var height = portrait ? landscapeWidth : portraitWidth;

        return await this._resizeWindow(pageInfo, width, height);
    }

    async _takeScreenshot (capture) {
        if (!this.screenshotCapturer.enabled) {
            this.warningLog.addWarning(WARNING_MESSAGE.screenshotsPathNotSpecified);
            return null;
        }

        try {
            var fileName = await capture();

            await generateThumbnail(fileName);

            return fileName;
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
                    pageInfo:   driverMsg.pageInfo,
                    stepName:   shortId.generate(),
                    customPath: command.path
                }));

            case COMMAND_TYPE.takeScreenshotOnFail:
                return await this._takeScreenshot(() => this.screenshotCapturer.captureError({
                    pageInfo:           driverMsg.pageInfo,
                    stepName:           shortId.generate(),
                    screenshotRequired: true
                }));

            case COMMAND_TYPE.resizeWindow:
                return await this._resizeWindow(driverMsg.pageInfo, command.width, command.height);

            case COMMAND_TYPE.resizeWindowToFitDevice:
                return await this._resizeWindowToFitDevice(driverMsg.pageInfo, command.device, command.options.portraitOrientation);
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
