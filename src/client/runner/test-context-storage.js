import hammerhead from './deps/hammerhead';

var JSON = hammerhead.json;

const STORAGE_KEY_PREFIX = "runner|";

export default class TestContextStorage {
    constructor (window, sessionId) {
        this.storage             = window.sessionStorage;
        this.storageKey          = STORAGE_KEY_PREFIX + sessionId;
        this.data                = null;
        this.beforeUnloadHandler = () => this._saveToStorage();

        this._loadFromStorage();
        hammerhead.on(hammerhead.EVENTS.beforeUnload, this.beforeUnloadHandler);
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
    }

    dispose () {
        hammerhead.off(hammerhead.EVENTS.beforeUnload, this.beforeUnloadHandler);

        this.storage.removeItem(this.storageKey);
    }
};
