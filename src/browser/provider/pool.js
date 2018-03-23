import Promise from 'pinkie';
import BUILT_IN_PROVIDERS from './built-in';
import BrowserProviderPluginHost from './plugin-host';
import parseProviderName from './parse-provider-name';
import BrowserProvider from './';
import BrowserConnection from '../connection';
import { GeneralError } from '../../errors/runtime';
import MESSAGE from '../../errors/runtime/message';

const BROWSER_PROVIDER_RE = /^([^:\s]+):?(.*)?$/;

export default {
    providersCache: {},

    async _handlePathAndCmd (alias) {
        var browserName  = JSON.stringify(alias);
        var providerName = 'path';
        var provider     = await this.getProvider(providerName);

        return { provider, providerName, browserName };
    },

    async _parseAliasString (alias) {
        var providerRegExpMatch = BROWSER_PROVIDER_RE.exec(alias);

        if (!providerRegExpMatch)
            throw new GeneralError(MESSAGE.cantFindBrowser, alias);

        var providerName = providerRegExpMatch[1];
        var browserName  = providerRegExpMatch[2] || '';

        var provider = await this.getProvider(providerName);

        if (!provider && providerRegExpMatch[2])
            provider = await this.getProvider(providerName + ':');

        if (!provider) {
            providerName = 'locally-installed';
            provider     = await this.getProvider(providerName);
            browserName  = providerRegExpMatch[1] || '';
        }

        return { provider, providerName, browserName };
    },

    async _parseAlias (alias) {
        if (alias && alias.path)
            return this._handlePathAndCmd(alias);

        if (typeof alias === 'string')
            return this._parseAliasString(alias);

        throw new GeneralError(MESSAGE.cantFindBrowser, alias);
    },

    async _getInfoForAllBrowserNames (provider, providerName) {
        var allBrowserNames = provider.isMultiBrowser ?
            await provider.getBrowserList() :
            [];

        if (!allBrowserNames.length)
            return { provider, providerName, browserName: '' };

        return allBrowserNames
            .map(browserName => ({ provider, providerName, browserName }));
    },

    _getProviderModule (providerName, moduleName) {
        try {
            var providerObject = require(moduleName);

            this.addProvider(providerName, providerObject);
            return this._getProviderFromCache(providerName);
        }
        catch (e) {
            return null;
        }
    },

    _getProviderFromCache (providerName) {
        return this.providersCache[providerName] || null;
    },

    _getBuiltinProvider (providerName) {
        var providerObject = BUILT_IN_PROVIDERS[providerName];

        if (!providerObject)
            return null;

        this.addProvider(providerName, providerObject);

        return this._getProviderFromCache(providerName);
    },

    async getBrowserInfo (alias) {
        if (alias instanceof BrowserConnection)
            return alias;

        var browserInfo = await this._parseAlias(alias);

        var { provider, providerName, browserName } = browserInfo;

        if (browserName === 'all')
            return await this._getInfoForAllBrowserNames(provider, providerName);

        if (!await provider.isValidBrowserName(browserName))
            throw new GeneralError(MESSAGE.cantFindBrowser, alias);

        return browserInfo;
    },

    addProvider (providerName, providerObject) {
        providerName = parseProviderName(providerName).providerName;

        this.providersCache[providerName] = new BrowserProvider(
            new BrowserProviderPluginHost(providerObject, providerName)
        );
    },

    removeProvider (providerName) {
        providerName = parseProviderName(providerName).providerName;

        delete this.providersCache[providerName];
    },

    async getProvider (providerName) {
        const parsedProviderName = parseProviderName(providerName);
        const moduleName         = parsedProviderName.moduleName;

        providerName = parsedProviderName.providerName;

        var provider = this._getProviderFromCache(providerName) ||
                       this._getProviderModule(providerName, moduleName) ||
                       this._getBuiltinProvider(providerName);

        if (provider)
            await this.providersCache[providerName].init();

        return provider;
    },

    dispose () {
        return Promise.all(Object.values(this.providersCache).map(item => item.dispose()));
    }
};
