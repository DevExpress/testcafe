import { APIError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';

const lazyRequire = require('import-lazy')(require);
const browserProviderPool = lazyRequire('../browser/provider/pool');

export default async function listBrowsers (providerName = 'locally-installed') {
    const provider = await browserProviderPool.getProvider(providerName);

    if (!provider)
        throw new APIError('listBrowsers', RUNTIME_ERRORS.browserProviderNotFound, providerName);
    return provider.isMultiBrowser
        ? await provider.getBrowserList()
        : [providerName];
}
