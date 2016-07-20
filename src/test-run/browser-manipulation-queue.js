import { EventEmitter } from 'events';
import shortId from 'shortid';
import { resize as resizeWindow, getViewportSize } from 'testcafe-browser-natives';
import { isServiceCommand } from './commands/utils';
import COMMAND_TYPE from './commands/type';
import Warning from '../warnings';
import WARNING_MESSAGE from '../warnings/message';

export default class BrowserManipulationQueue extends EventEmitter {
    constructor (windowId, screenshotCapturer) {
        super();

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

    async _takeScreenshot (capture) {
        if (!this.screenshotCapturer.enabled) {
            this.emit('warning', new Warning(WARNING_MESSAGE.screenshotsPathNotSpecified));
            return null;
        }

        try {
            return await capture();
        }
        catch (err) {
            this.emit('warning', new Warning(WARNING_MESSAGE.screenshotError, err.message));
            return null;
        }
    }

    async executePendingManipulation (driverMsg) {
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
