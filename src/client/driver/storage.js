import hammerhead from './deps/hammerhead';

const JSON          = hammerhead.json;
const nativeMethods = hammerhead.nativeMethods;

const STORAGE_KEY_PREFIX = 'testcafe|driver|';

export default class Storage {
    constructor (window, testRunId, windowId) {
        this.storage    = nativeMethods.winSessionStorageGetter.call(window);
        this.storageKey = this._createStorageKey(testRunId, windowId);
        this.data       = {};

        this._loadFromStorage();
    }

    _createStorageKey (testRunId, windowId) {
        const storageKey = STORAGE_KEY_PREFIX + testRunId;

        if (windowId)
            return storageKey + '|' + windowId;

        return storageKey;
    }

    _loadFromStorage () {
        const savedData = nativeMethods.storageGetItem.call(this.storage, this.storageKey);

        if (savedData) {
            this.data = JSON.parse(savedData);
            nativeMethods.storageRemoveItem.call(this.storage, this.storageKey);
        }
    }

    save () {
        nativeMethods.storageSetItem.call(this.storage, this.storageKey, JSON.stringify(this.data));
    }

    setItem (prop, value) {
        this.data[prop] = value;
        this.save();
    }

    getItem (prop) {
        return this.data[prop];
    }

    dispose () {
        nativeMethods.storageRemoveItem.call(this.storage, this.storageKey);
    }
}
