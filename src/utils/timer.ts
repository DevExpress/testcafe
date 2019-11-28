export default class Timer {
    public expired: boolean;
    public promise: Promise<void>;

    public constructor (timeout: number) {
        this.expired = false;

        this.promise = new Promise(resolve => {
            setTimeout(resolve, timeout);
        });

        this.promise.then(() => this._expire());
    }

    private _expire (): void {
        this.expired = true;
    }
}
