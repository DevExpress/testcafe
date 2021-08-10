import APIBasedTestFileCompilerBase from './api-based';
import { Dictionary } from '../../configuration/interfaces';

const Module = require('module');

let cachePrefix: string | null = null;
let storedComplilerId: string | null = null;
let cachePrevented = false;

function getFileNameCacheKey (fileName: string): string {
    if (!cachePrevented && cachePrefix && storedComplilerId !== cachePrefix &&
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
        if (!storedComplilerId)
            storedComplilerId = compilerId;

        cachePrefix = compilerId;
    }

    public stopExternalCaching (): void {
        cachePrefix = null;
    }

    public preventCaching (): void {
        cachePrevented = true;
    }
}

export default new RequireCacheProxy();
