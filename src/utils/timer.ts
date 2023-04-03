export default class Timer {
    public expired: boolean;
    public promise: Promise<void>;
    private timerId: number;

    public constructor (timeout: number) {
        this.expired = false;
        this.timerId = -1;

        this.promise = new Promise(resolve => {
            this.timerId = setTimeout(resolve, timeout);
        });

        this.promise.then(() => this._expire());
    }

    private _expire (): void {
        this.expired = true;
    }

    public clearTimer (): void {
        clearTimeout(this.timerId);
    }
}
