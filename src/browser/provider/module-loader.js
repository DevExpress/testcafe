const BROWSER_PROVIDER_SCOPED_PACKAGE_RE = /^@([^/]+)\/(.+)$/;
const BROWSER_PROVIDER_PREFIX = 'testcafe-browser-provider-';

export default class BrowserProviderModuleLoader {
    loadModule (providerName) {
        var providerObject = null;

        if (this.isScopedProvider(providerName))
            providerObject = require(`${this.getScopedProviderModuleName(providerName)}`);
        else {
            providerName = this.cleanStringOfDefaultPackagePrefix(providerName);
            providerObject = require(`testcafe-browser-provider-${providerName}`);
        }
        return providerObject;
    }

    isScopedProvider (providerName) {
        return BROWSER_PROVIDER_SCOPED_PACKAGE_RE.exec(providerName);
    }

    getScopedProviderModuleName (providerName) {
        providerName = this.cleanStringOfDefaultPackagePrefix(providerName);
        var parsedProviderName = BROWSER_PROVIDER_SCOPED_PACKAGE_RE.exec(providerName);

        return `@${parsedProviderName[1]}/testcafe-browser-provider-${parsedProviderName[2]}`;
    }

    cleanStringOfDefaultPackagePrefix (providerName) {
        return providerName.replace(BROWSER_PROVIDER_PREFIX, '');
    }

}

