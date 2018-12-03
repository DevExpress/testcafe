export default class FlagList {
    constructor ({ initialFlagValue, flags }) {
        this.initialFlagValue = initialFlagValue;
        flags.forEach(flag => this[flag] = initialFlagValue);
    }

    reset () {
        Object.getOwnPropertyNames(this)
            .filter(name => name !== 'initialFlagValue')
            .forEach(name => this[name] = !this.initialFlagValue);
    }
}
