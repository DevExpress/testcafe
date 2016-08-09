import browserNatives from 'testcafe-browser-natives';
import PathBrowserProvider from './path';


export default class LocallyInstalledBrowserProvider extends PathBrowserProvider {
    constructor () {
        super();

        this.isMultiBrowser = true;
    }

    async getBrowserList () {
        var installations = await browserNatives.getInstallations();

        return Object.keys(installations);
    }

    async isValidBrowserName (browserName) {
        var browserNames = await this.getBrowserList();

        return browserNames.indexOf(browserName) > -1;
    }
}
