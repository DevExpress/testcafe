import renderTemplate from '../utils/render-template';

export default class WarningLog {
    public messages: string[];
    public globalLog: WarningLog | null;
    public callback?: (message: string) => void;

    public constructor (globalLog: WarningLog | null = null, callback?: (message: string) => void) {
        this.globalLog = globalLog;
        this.messages  = [];
        this.callback  = callback;
    }

    public addPlainMessage (msg: string): void {
        // NOTE: avoid duplicates
        if (!this.messages.includes(msg))
            this.messages.push(msg);
    }

    public addWarning (...args: any[]): void {
        // @ts-ignore
        const msg = renderTemplate.apply(null, args);

        this.addPlainMessage(msg);

        if (this.globalLog)
            this.globalLog.addPlainMessage(msg);

        if (this.callback)
            this.callback(msg);
    }

    public clear (): void {
        this.messages = [];
    }

    public copyTo (warningLog: WarningLog): void {
        this.messages.forEach(msg => warningLog.addWarning(msg));
    }
}
