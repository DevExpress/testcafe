const BROWSER_PROVIDER_SCOPED_PACKAGE_RE = /^@\S+\/\S/;
const BROWSER_PROVIDER_PARSER_RE = /@([\w-]+)\/(.*)/g;

export default class BrowserProviderModuleLoader {
    loadModule (providerName) {
        var providerObject = null;

        if (this.isPrivateModule(providerName))
            providerObject = require(`${this.fillPrivateModuleValue(providerName)}`);
        else
            providerObject = require(`testcafe-browser-provider-${providerName}`);
        return providerObject;
    }

    isPrivateModule (providerName) {
        return BROWSER_PROVIDER_SCOPED_PACKAGE_RE.exec(providerName);
    }

    fillPrivateModuleValue (providerName) {
        var parsedProviderName = BROWSER_PROVIDER_PARSER_RE.exec(providerName);

        return `@${parsedProviderName[1]}/testcafe-browser-provider-${parsedProviderName[2]}`;
    }
}
