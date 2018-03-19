/*eslint linebreak-style: ["error", "windows"]*/

const BROWSER_PROVIDER_SCOPED_PACKAGE_RE = /^@/i;

export default class BrowserProviderModuleLoader {
    loadModule (providerName) {
        var providerObject = null;

        if (BROWSER_PROVIDER_SCOPED_PACKAGE_RE.exec(providerName))
            providerObject = require(`${providerName}`);
        else
            providerObject = require(`testcafe-browser-provider-${providerName}`);
        return providerObject;
    }
}
