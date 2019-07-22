export default class FlagList {
    constructor (flags) {
        Object.defineProperty(this, '_initialFlagValue', { writable: true, value: false });

        flags.forEach(flag => {
            this[flag] = false;
        });
    }

    reset () {
        Object.getOwnPropertyNames(this)
            .forEach(name => {
                this[name] = !this._initialFlagValue;
            });
    }
}
