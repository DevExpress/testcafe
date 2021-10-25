import renderTemplate from '../utils/render-template';
import TestRun from '../test-run';
import MessageBus from '../utils/message-bus';

export interface WarningLogMessage {
    message: string;
    actionId: string | null;
}

export default class WarningLog {
    public messageInfos: WarningLogMessage[];
    public globalLog: WarningLog | null;
    public callback?: (message: string, actionId: string | null) => Promise<void>;

    public constructor (globalLog: WarningLog | null = null, callback?: (message: string, actionId: string | null) => Promise<void>) {
        this.messageInfos = [];

        this.globalLog = globalLog;
        this.callback  = callback;
    }

    public get messages (): string[] {
        return this.messageInfos.map(msg => msg.message);
    }

    public addPlainMessage (msg: WarningLogMessage): void {
        // NOTE: avoid duplicates
        if (!this.messageInfos.find(m => m.message === msg.message))
            this.messageInfos.push(msg);
    }

    public addWarning (msg: WarningLogMessage | string, ...args: any[]): void {
        let message  = '';
        let actionId = null;

        if (typeof msg !== 'string')
            ({ message, actionId } = msg);
        else
            message = msg;

        args = [message].concat(args);

        // @ts-ignore
        message = renderTemplate.apply(null, args);

        this.addPlainMessage({ message, actionId });

        if (this.globalLog)
            this.globalLog.addPlainMessage({ message, actionId });

        if (this.callback)
            this.callback(message, actionId);
    }

    public clear (): void {
        this.messageInfos = [];
    }

    public copyTo (warningLog: WarningLog): void {
        this.messages.forEach(msg => warningLog.addWarning(msg));
    }

    public static createAddWarningCallback (messageBus?: MessageBus | object, testRun?: TestRun): (message: string, actionId: string | null) => Promise<void> {
        return async (message: string, actionId: string | null) => {
            if (messageBus && messageBus instanceof MessageBus) {
                const warning = {
                    message,
                    testRun,
                    actionId,
                };

                await messageBus.emit('before-warning-add', warning);
                await messageBus.emit('warning-add', warning);
            }
        };
    }
}
