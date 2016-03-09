import hammerhead from './deps/hammerhead';

var JSON = hammerhead.json;

const STORAGE_KEY_PREFIX = 'testcafe|driver|';

export default class Storage {
    constructor (window, testRunId) {
        this.storage    = window.sessionStorage;
        this.storageKey = STORAGE_KEY_PREFIX + testRunId;
        this.data       = {};

        this._loadFromStorage();
    }

    _loadFromStorage () {
        var savedData = this.storage.getItem(this.storageKey);

        if (savedData) {
            this.data = JSON.parse(savedData);
            this.storage.removeItem(this.storageKey);
        }
    }

    _saveToStorage () {
        this.storage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    setItem (prop, value) {
        this.data[prop] = value;
        this._saveToStorage();
    }

    getItem (prop) {
        return this.data[prop];
    }

    dispose () {
        this.storage.removeItem(this.storageKey);
    }
}
