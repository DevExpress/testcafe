import { getBrowserInfo } from 'testcafe-browser-tools';
import getMaximizedHeadlessWindowSize from '../../utils/get-maximized-headless-window-size';

export default {
    openedBrowsers: {},

    isMultiBrowser: false,

    _getConfig () {
        throw new Error('Not implemented');
    },

    _getBrowserName () {
        return this.providerName.replace(':', '');
    },

    async isValidBrowserName (browserName) {
        const config      = await this._getConfig(browserName);
        const browserInfo = await getBrowserInfo(config.path || this._getBrowserName());

        return !!browserInfo;
    },

    async isLocalBrowser () {
        return true;
    },

    isHeadlessBrowser (browserId) {
        return this.openedBrowsers[browserId].config.headless;
    },

    async maximizeWindow (browserId) {
        const maximumSize = getMaximizedHeadlessWindowSize();

        await this.resizeWindow(browserId, maximumSize.width, maximumSize.height, maximumSize.width, maximumSize.height);
    }
};
