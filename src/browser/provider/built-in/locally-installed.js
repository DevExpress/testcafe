import browserTools from 'testcafe-browser-tools';


export default {
    isMultiBrowser: true,

    async openBrowser (browserId, pageUrl, browserName) {
        var args  = browserName.split(' ');
        var alias = args.shift();

        var browserInfo    = await browserTools.getBrowserInfo(alias);
        var openParameters = Object.assign({}, browserInfo);

        if (args.length)
            openParameters.cmd = args.join(' ') + (openParameters.cmd ? ' ' + openParameters.cmd : '');

        await browserTools.open(openParameters, pageUrl);
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
