/*eslint linebreak-style: ["error", "windows"]*/

const BROWSER_PROVIDER_SCOPED_PACKAGE_RE = /^@\S+\/testcafe-browser-provider\S/;

export default class BrowserProviderModuleLoader {
    loadModule (providerName) {
        var providerObject = null;

        if (this.isPrivateModule(providerName))
            providerObject = require(`${providerName}`);
        else
            providerObject = require(`testcafe-browser-provider-${providerName}`);
        return providerObject;
    }

    isPrivateModule (providerName) {
        return BROWSER_PROVIDER_SCOPED_PACKAGE_RE.exec(providerName);
    }

}
