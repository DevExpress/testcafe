import hammerhead from './deps/hammerhead';

const JSON          = hammerhead.json;
const nativeMethods = hammerhead.nativeMethods;

const STORAGE_KEY_PREFIX    = 'testcafe|driver|';
const PROXYLESS_STORAGE_KEY = '%proxylessContextStorage%';

class StorageStrategy {
    constructor (window, testRunId, windowId) {
        this.storage    = nativeMethods.winSessionStorageGetter.call(window);
        this.storageKey = this._createStorageKey(testRunId, windowId);
    }

    _createStorageKey (testRunId, windowId) {
        const storageKey = STORAGE_KEY_PREFIX + testRunId;

        if (windowId)
            return storageKey + '|' + windowId;

        return storageKey;
    }

    loadFromStorage () {
        let res = { };

        const savedData = this._getData();

        if (savedData) {
            res = JSON.parse(savedData);

            this._deleteData();
        }

        return res;
    }

    _getData () {
        return nativeMethods.storageGetItem.call(this.storage, this.storageKey);
    }

    _deleteData () {
        nativeMethods.storageRemoveItem.call(this.storage, this.storageKey);
    }

    save (data) {
        nativeMethods.storageSetItem.call(this.storage, this.storageKey, JSON.stringify(data));
    }

    dispose () {
        nativeMethods.storageRemoveItem.call(this.storage, this.storageKey);
    }
}

class StorageStrategyProxyless extends StorageStrategy {
    _getData () {
        return super._getData() || window[PROXYLESS_STORAGE_KEY];
    }

    _deleteData () {
        super._deleteData();

        window[PROXYLESS_STORAGE_KEY] = null;
    }

    save (data) {
        super.save(data);

        if (window.PROXYLESS_STORAGE_BINDING)
            window.PROXYLESS_STORAGE_BINDING(JSON.stringify(data));
    }
}

export default class Storage {
    constructor (window, { testRunId, windowId, proxyless }) {
        this.strategy  = this._createStorageStrategy(proxyless, window, testRunId, windowId);
        this.data      = this.strategy.loadFromStorage();
    }

    _createStorageStrategy (proxyless, window, testRunId, windowId) {
        return proxyless ? new StorageStrategyProxyless(window, testRunId, windowId) : new StorageStrategy(window, testRunId, windowId);
    }

    save () {
        this.strategy.save(this.data);
    }

    setItem (prop, value) {
        this.data[prop] = value;

        this.save(this.data);
    }

    getItem (prop) {
        return this.data[prop];
    }

    dispose () {
        this.strategy.dispose();
    }
}
