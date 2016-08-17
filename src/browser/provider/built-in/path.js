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

    async openBrowser (id, alias, startPage) {
        var openParameters = await browserNatives.getBrowserInfo(alias) || await this._handleJSON(alias);

        if (!openParameters)
            throw new Error('The specified browser name is not valid!');

        await browserNatives.open(openParameters, startPage);

        if (OS.win)
            await super.calculateResizeCorrections(id);
    }

    async closeBrowser (id, pageInfo) {
        await browserNatives.close(pageInfo.title);
    }

    async getBrowserList () {
        return [
            '${PATH_TO_BROWSER_EXECUTABLE}'
        ];
    }
}
