import uuid from 'uuid';
import { resize as resizeWindow } from 'testcafe-browser-natives';
import SCREENSHOTS_WARNING_MESSAGES from '../runner/screenshots/warning-messages';


const PORTRAIT_ORIENTATION  = 'portrait';
const LANDSCAPE_ORIENTATION = 'landscape';


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
            return null;
        }
    }

    async takeScreenshotOnFail (windowId) {
        if (!this.screenshotCapturer.enabled)
            return SCREENSHOTS_WARNING_MESSAGES.screenshotDirNotSet;

        try {
            return await this.screenshotCapturer.captureError(
                windowId,
                { stepName: uuid.v4(), screenshotRequired: true }
            );
        }
        catch (e) {
            return SCREENSHOTS_WARNING_MESSAGES.cannotCreate;
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
