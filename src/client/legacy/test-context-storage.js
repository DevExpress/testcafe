import hammerhead from './deps/hammerhead';

var JSON = hammerhead.json;

const STORAGE_KEY_PREFIX = "runner|";

export default class TestContextStorage {
    constructor (window, testRunId) {
        this.storage    = window.sessionStorage;
        this.storageKey = STORAGE_KEY_PREFIX + testRunId;
        this.data       = null;

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

    get () {
        return this.data;
    }

    set (newData) {
        this.data = newData;
        this._saveToStorage();
    }

    setProperty (prop, value) {
        this.data[prop] = value;
        this._saveToStorage();
    }

    dispose () {
        this.storage.removeItem(this.storageKey);
    }
};
