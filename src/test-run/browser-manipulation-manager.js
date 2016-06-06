import uuid from 'uuid';
import { resize as resizeWindow } from 'testcafe-browser-natives';


const SCREENSHOT_CAN_NOT_BE_CREATED_MESSAGE = '[was unable to take a screenshot due to some error]';
const PORTRAIT_ORIENTATION                  = 'portrait';
const LANDSCAPE_ORIENTATION                 = 'landscape';


export default class BrowserManipulationManager {
    constructor (screenshotCapturer) {
        this.screenshotCapturer = screenshotCapturer;
    }

    async takeScreenshot (windowId, customPath) {
        try {
            return await this.screenshotCapturer.captureAction(
                windowId,
                { stepName: uuid.v4(), customPath: customPath }
            );
        }
        catch (e) {
            // NOTE: swallow the error silently if we can't take screenshots for some
            // reason (e.g. we don't have permissions to write a screenshot file).
            return SCREENSHOT_CAN_NOT_BE_CREATED_MESSAGE;
        }
    }

    async takeScreenshotOnFail (windowId) {
        try {
            return await this.screenshotCapturer.captureError(
                windowId,
                { stepName: uuid.v4(), screenshotRequired: true }
            );
        }
        catch (e) {
            // NOTE: swallow the error silently if we can't take screenshots for some
            // reason (e.g. we don't have permissions to write a screenshot file).
            return SCREENSHOT_CAN_NOT_BE_CREATED_MESSAGE;
        }
    }

    static async resizeWindow (windowId, currentWidth, currentHeight, width, height) {
        return await resizeWindow(windowId, currentWidth, currentHeight, width, height);
    }

    static async resizeWindowToFitDevice (windowId, currentWidth, currentHeight, device, portrait) {
        return await resizeWindow(windowId, currentWidth, currentHeight, device,
            portrait ? PORTRAIT_ORIENTATION : LANDSCAPE_ORIENTATION);
    }
}
