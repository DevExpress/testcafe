import browserTools from 'testcafe-browser-tools';


export default {
    isMultiBrowser: true,

    async openBrowser (browserId, pageUrl, browserName) {
        var args  = browserName.split(' ');
        var alias = args.shift();

        var openParameters = await browserTools.getBrowserInfo(alias);

        if (args.length)
            openParameters.cmd += (openParameters.cmd ? ' ' : '') + args.join(' ');

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

        browserName = browserName.toLowerCase().split(' ')[0];

        return browserNames.indexOf(browserName) > -1;
    }
};
