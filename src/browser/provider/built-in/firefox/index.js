import browserTools from 'testcafe-browser-tools';
import getRuntimeInfo from './runtime-info';
import { start as startLocalFirefox } from './local-firefox';


export default {
    openedBrowsers: {},

    isMultiBrowser: false,

    async openBrowser (browserId, pageUrl, configString) {
        var runtimeInfo = await getRuntimeInfo(configString);
        var browserName = this.providerName.replace(':', '');

        runtimeInfo.browserId   = browserId;
        runtimeInfo.browserName = browserName;

        await startLocalFirefox(pageUrl, runtimeInfo);
    },

    async closeBrowser (browserId) {
        await browserTools.close(browserId);
    },

    async isLocalBrowser () {
        return true;
    },
};
