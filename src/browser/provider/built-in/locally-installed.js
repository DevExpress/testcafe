import browserTools from 'testcafe-browser-tools';


export default {
    isMultiBrowser: true,

    async openBrowser (browserId, pageUrl, browserName) {
        var openParameters = await browserTools.getBrowserInfo(browserName);

        await browserTools.open(openParameters, pageUrl);
    },

    async closeBrowser (browserId) {
        await browserTools.close(browserId);
    },

    async isLocalBrowser () {
        return true;
    },

    async getBrowserList () {
        var installations = await browserTools.getInstallations();

        return Object.keys(installations);
    },

    async isValidBrowserName (browserName) {
        var browserNames = await this.getBrowserList();

        browserName = browserName.toLowerCase();

        return browserNames.indexOf(browserName) > -1;
    }
};
