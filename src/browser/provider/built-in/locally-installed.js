import browserTools from 'testcafe-browser-tools';
import PathBrowserProvider from './path';


export default class LocallyInstalledBrowserProvider extends PathBrowserProvider {
    constructor () {
        super();

        this.isMultiBrowser = true;
    }

    async getBrowserList () {
        var installations = await browserTools.getInstallations();

        return Object.keys(installations);
    }

    async isValidBrowserName (browserName) {
        var browserNames = await this.getBrowserList();

        browserName = browserName.toLowerCase();

        return browserNames.indexOf(browserName) > -1;
    }
}
