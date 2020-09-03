export default class FlagList {
    [key: string]: any;

    public constructor (flags: string[]) {
        Object.defineProperty(this, '_initialFlagValue', { writable: true, value: false });

        flags.forEach(flag => {
            this[flag] = false;
        });
    }

    public reset (): void {
        Object.getOwnPropertyNames(this)
            .forEach(name => {
                this[name] = !this._initialFlagValue;
            });
    }
}
