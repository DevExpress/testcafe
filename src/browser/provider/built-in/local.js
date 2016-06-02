import browserNatives from 'testcafe-browser-natives';
import PathBrowserProvider from './path';


export default class LocalBrowserProvider extends PathBrowserProvider {
    constructor () {
        super();

        this.hasOptionalBrowserNames = true;
    }

    async listAvailableOptionalBrowserNames () {
        var installations = await browserNatives.getInstallations();

        return Object.keys(installations);
    }

    async isValidBrowserName (browserName) {
        var browserNames = await this.listAvailableOptionalBrowserNames();

        return browserNames.indexOf(browserName) > -1;
    }
}
