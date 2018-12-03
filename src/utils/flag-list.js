export default class FlagList {
    constructor ({ initialFlagValue, flags }) {
        Object.defineProperty(this, '_initialFlagValue', { writable: true, value: initialFlagValue });

        flags.forEach(flag => {
            this[flag] = initialFlagValue;
        });
    }

    reset () {
        Object.getOwnPropertyNames(this)
            .forEach(name => {
                this[name] = !this._initialFlagValue;
            });
    }
}
