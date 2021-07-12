import browserTools from 'testcafe-browser-tools';
import { splitQuotedText } from '../../../utils/string';

export default {
    isMultiBrowser: true,

    async _handleString (str) {
        const args = splitQuotedText(str, ' ', '`"\'');
        const path = args.shift();

        const browserInfo = await browserTools.getBrowserInfo(path);

        if (!browserInfo)
            return null;

        const params = Object.assign({}, browserInfo);

        if (args.length)
            params.cmd = args.join(' ') + (params.cmd ? ' ' + params.cmd : '');

        return params;
    },

    async _handleJSON (str) {
        let params = null;

        try {
            params = JSON.parse(str);
        }
        catch (e) {
            return null;
        }

        if (!params.path)
            return null;

        const openParameters = await browserTools.getBrowserInfo(params.path);

        if (!openParameters)
            return null;

        if (params.cmd)
            openParameters.cmd = params.cmd;

        return openParameters;
    },

    async openBrowser (browserId, pageUrl, browserName) {
        const openParameters = await this._handleString(browserName) || await this._handleJSON(browserName);

        if (!openParameters)
            throw new Error('The specified browser name is not valid!');

        await browserTools.open(openParameters, pageUrl);
    },

    async isLocalBrowser () {
        return true;
    },
};
