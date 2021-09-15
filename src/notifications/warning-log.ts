import renderTemplate from '../utils/render-template';
import TestRun from '../test-run';
import MessageBus from '../utils/message-bus';

export default class WarningLog {
    public messages: string[];
    public globalLog: WarningLog | null;
    public callback?: (message: string) => Promise<void>;

    public constructor (globalLog: WarningLog | null = null, callback?: (message: string) => Promise<void>) {
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

    public static creatAddWarningCallback (messageBus?: MessageBus | object, testRun?: TestRun): (message: string) => Promise<void> {
        return async (message: string) => {
            if (messageBus && messageBus instanceof MessageBus) {
                await messageBus.emit('warning-add', {
                    message,
                    testRun,
                });
            }
        };
    }
}
