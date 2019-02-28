import Promise from 'pinkie';
import BUILT_IN_PROVIDERS from './built-in';
import BrowserProviderPluginHost from './plugin-host';
import parseProviderName from './parse-provider-name';
import BrowserProvider from './';
import BrowserConnection from '../connection';
import { GeneralError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';

const BROWSER_PROVIDER_RE = /^([^:\s]+):?(.*)?$/;

export default {
    providersCache: {},

    async _handlePathAndCmd (alias) {
        const browserName  = JSON.stringify(alias);
        const providerName = 'path';
        const provider     = await this.getProvider(providerName);

        return { provider, providerName, browserName };
    },

    async _parseAliasString (alias) {
        const providerRegExpMatch = BROWSER_PROVIDER_RE.exec(alias);

        if (!providerRegExpMatch)
            throw new GeneralError(RUNTIME_ERRORS.cannotFindBrowser, alias);

        let providerName = providerRegExpMatch[1];
        let browserName  = providerRegExpMatch[2] || '';

        let provider = await this.getProvider(providerName);

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
        if (alias.browserName && alias.providerName && alias.provider)
            return alias;

        if (alias && alias.path)
            return this._handlePathAndCmd(alias);

        if (typeof alias === 'string')
            return this._parseAliasString(alias);

        throw new GeneralError(RUNTIME_ERRORS.cannotFindBrowser, alias);
    },

    async _getInfoForAllBrowserNames (provider, providerName) {
        const allBrowserNames = provider.isMultiBrowser ?
            await provider.getBrowserList() :
            [];

        if (!allBrowserNames.length)
            return { provider, providerName, browserName: '' };

        return allBrowserNames
            .map(browserName => ({ provider, providerName, browserName }));
    },

    _getProviderModule (providerName, moduleName) {
        try {
            const providerObject = require(moduleName);

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
        const providerObject = BUILT_IN_PROVIDERS[providerName];

        if (!providerObject)
            return null;

        this.addProvider(providerName, providerObject);

        return this._getProviderFromCache(providerName);
    },

    async getBrowserInfo (alias) {
        if (alias instanceof BrowserConnection)
            return alias;

        const browserInfo = await this._parseAlias(alias);

        const { provider, providerName, browserName } = browserInfo;

        if (browserName === 'all')
            return await this._getInfoForAllBrowserNames(provider, providerName);

        if (!await provider.isValidBrowserName(browserName))
            throw new GeneralError(RUNTIME_ERRORS.cannotFindBrowser, alias);

        return { alias, ...browserInfo };
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

        const provider = this._getProviderFromCache(providerName) ||
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
