import browserTools from 'testcafe-browser-tools';

export default {
    openedBrowsers: {},

    isMultiBrowser: true,

    supportMultipleWindows: true,

    needCleanUpBrowserInfo: true,

    getActiveWindowId (browserId) {
        return this.openedBrowsers[browserId].activeWindowId;
    },

    setActiveWindowId (browserId, val) {
        this.openedBrowsers[browserId].activeWindowId = val;
    },

    cleanUpBrowserInfo (browserId) {
        delete this.openedBrowsers[browserId];
    },

    async openBrowser (browserId, pageUrl, browserName, allowMultipleWindows) {
        const args  = browserName.split(' ');
        const alias = args.shift();

        const browserInfo    = await browserTools.getBrowserInfo(alias);
        const openParameters = Object.assign({}, browserInfo);

        if (args.length)
            openParameters.cmd = args.join(' ') + (openParameters.cmd ? ' ' + openParameters.cmd : '');

        await browserTools.open(openParameters, pageUrl);

        let activeWindowId = null;

        if (allowMultipleWindows)
            activeWindowId = this.calculateWindowId();

        this.openedBrowsers[browserId] = { activeWindowId };
    },

    async isLocalBrowser () {
        return true;
    },

    async getBrowserList () {
        const installations = await browserTools.getInstallations();

        return Object.keys(installations);
    },

    async isValidBrowserName (browserName) {
        const browserNames = await this.getBrowserList();

        browserName = browserName.toLowerCase().split(' ')[0];

        return browserNames.indexOf(browserName) > -1;
    }
};
