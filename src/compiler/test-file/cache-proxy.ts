import APIBasedTestFileCompilerBase from './api-based';
import { Dictionary } from '../../configuration/interfaces';

const Module = require('module');

let cachePrefix: string | null = null;

function getFileNameCacheKey (fileName: string): string {
    if (cachePrefix &&
        !APIBasedTestFileCompilerBase._isNodeModulesDep(fileName) &&
        !APIBasedTestFileCompilerBase._isTestCafeLibDep(fileName))
        return `${fileName}_${cachePrefix}`;

    return fileName;
}

const handlers         = {
    get: function (target: Dictionary<typeof Module>, filename: string) {
        return target[getFileNameCacheKey(filename)];
    },
    set: function (target: Dictionary<typeof Module>, filename: string, value: typeof Module) {
        target[getFileNameCacheKey(filename)] = value;

        return true;
    },
};

class RequireCacheProxy {
    private _proxy: typeof Proxy;

    public constructor () {
        this._proxy = new Proxy(Module._cache, handlers);

        Module._cache = this._proxy;
    }

    public startExternalCaching (compilerId: string): void {
        cachePrefix = compilerId;
    }

    public stopExternalCaching (): void {
        cachePrefix = null;
    }
}

export default new RequireCacheProxy();
