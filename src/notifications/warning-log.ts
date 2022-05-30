import renderTemplate from '../utils/render-template';
import TestRun from '../test-run';
import MessageBus from '../utils/message-bus';

export interface WarningLogMessage {
    message: string;
    actionId: string | null;
}

type WarningLogCallback = (message: string, actionId: string | null) => Promise<void>;

export default class WarningLog {
    public messageInfos: WarningLogMessage[];
    public globalLog: WarningLog | null;
    public callback?: WarningLogCallback;
    private _isCopying: boolean;

    public constructor (globalLog: WarningLog | null = null, callback?: WarningLogCallback) {
        this.messageInfos = [];
        this.globalLog    = globalLog;
        this.callback     = callback;
        this._isCopying   = false;
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
        message = renderTemplate.apply(null, args); // eslint-disable-line prefer-spread

        this.addPlainMessage({ message, actionId });

        if (this.globalLog)
            this.globalLog.addPlainMessage({ message, actionId });

        if (this.callback && !this._isCopying)
            this.callback(message, actionId);
    }

    public clear (): void {
        this.messageInfos = [];
    }

    public copyFrom (warningLog: WarningLog): void {
        this._isCopying = true;
        warningLog.messages.forEach(msg => this.addWarning(msg));
        this._isCopying = false;
    }

    public static createAddWarningCallback (messageBus?: MessageBus | object, testRun?: TestRun): WarningLogCallback {
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
