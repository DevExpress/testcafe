import browserNatives from 'testcafe-browser-natives';
import OS from 'os-family';
import BrowserProviderBase from './base';


export default class PathBrowserProvider extends BrowserProviderBase {
    constructor () {
        super();

        this.isMultiBrowser = true;
    }

    async _handleJSON (str) {
        var params = null;

        try {
            params = JSON.parse(str);
        }
        catch (e) {
            return null;
        }

        if (!params.path)
            return null;

        var openParameters = await browserNatives.getBrowserInfo(params.path);

        if (!openParameters)
            return null;

        if (params.cmd)
            openParameters.cmd = params.cmd;

        return openParameters;
    }

    async openBrowser (browserId, pageUrl, browserName) {
        var openParameters = await browserNatives.getBrowserInfo(browserName) || await this._handleJSON(browserName);

        if (!openParameters)
            throw new Error('The specified browser name is not valid!');

        await browserNatives.open(openParameters, pageUrl);

        if (OS.win)
            await super.calculateResizeCorrections(browserId);
    }

    async closeBrowser (browserId) {
        await browserNatives.close(browserId);
    }

    async getBrowserList () {
        return [
            '${PATH_TO_BROWSER_EXECUTABLE}'
        ];
    }
}
