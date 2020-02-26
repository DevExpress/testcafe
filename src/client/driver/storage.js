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
        const savedData = this.storage.getItem(this.storageKey);

        if (savedData) {
            this.data = JSON.parse(savedData);
            this.storage.removeItem(this.storageKey);
        }
    }

    save () {
        this.storage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    setItem (prop, value) {
        this.data[prop] = value;
        this.save();
    }

    getItem (prop) {
        return this.data[prop];
    }

    dispose () {
        this.storage.removeItem(this.storageKey);
    }
}
