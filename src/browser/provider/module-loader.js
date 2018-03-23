const BROWSER_PROVIDER_SCOPED_PACKAGE_RE = /^@([^/]+)\/(.+)$/;

export default class BrowserProviderModuleLoader {
    loadModule (providerName) {
        var providerObject = null;

        if (this.isScopedProvider(providerName))
            providerObject = require(`${this.getScopedProviderModuleName(providerName)}`);
        else
            providerObject = require(`testcafe-browser-provider-${providerName}`);
        return providerObject;
    }

    isScopedProvider (providerName) {
        return BROWSER_PROVIDER_SCOPED_PACKAGE_RE.exec(providerName);
    }

    getScopedProviderModuleName (providerName) {
        var parsedProviderName = BROWSER_PROVIDER_SCOPED_PACKAGE_RE.exec(providerName);

        return `@${parsedProviderName[1]}/testcafe-browser-provider-${parsedProviderName[2]}`;
    }
}

