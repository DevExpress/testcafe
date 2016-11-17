import browserTools from 'testcafe-browser-tools';
import { splitQuotedText } from '../../../utils/string';


export default {
    isMultiBrowser: true,

    async _handleString (str) {
        var args = splitQuotedText(str, ' ', '`"\'');
        var path = args.shift();

        var params = await browserTools.getBrowserInfo(path);

        if (!params)
            return null;

        if (args.length)
            params.cmd += (params.cmd ? ' ' : '') + args.join(' ');

        return params;
    },

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

        var openParameters = await browserTools.getBrowserInfo(params.path);

        if (!openParameters)
            return null;

        if (params.cmd)
            openParameters.cmd = params.cmd;

        return openParameters;
    },

    async openBrowser (browserId, pageUrl, browserName) {
        var openParameters = await this._handleString(browserName) || await this._handleJSON(browserName);

        if (!openParameters)
            throw new Error('The specified browser name is not valid!');

        await browserTools.open(openParameters, pageUrl);
    },

    async closeBrowser (browserId) {
        await browserTools.close(browserId);
    },

    async isLocalBrowser () {
        return true;
    }
};
