import renderTemplate from '../utils/render-template';

export default class WarningLog {
    public messages: string[];
    public globalLog: WarningLog | null;

    public constructor (globalLog: WarningLog | null = null) {
        this.globalLog = globalLog;
        this.messages  = [];
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
    }

    public clear (): void {
        this.messages = [];
    }

    public copyTo (warningLog: WarningLog): void {
        this.messages.forEach(msg => warningLog.addWarning(msg));
    }
}
