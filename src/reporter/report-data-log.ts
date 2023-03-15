import MessageBus from '../utils/message-bus';
import TestRun from '../test-run';

export interface ReportDataLogItem {
    data: any;
    testRun: TestRun;
}

type ReportDataLogCallback = (data: any) => Promise<void>;

export default class ReportDataLog {
    private readonly _data: any[];
    public callback?: ReportDataLogCallback;

    public constructor (callback?: ReportDataLogCallback) {
        this._data    = [];
        this.callback = callback;
    }

    public get data (): any[] {
        return this._data;
    }

    public async addData (data: any[]): Promise<void> {
        if (this.callback)
            await this.callback(data);

        this._data.push(...data);
    }

    public static createAddDataCallback (messageBus: MessageBus | undefined, testRun: TestRun): ReportDataLogCallback {
        return async (data: any[]) => {
            if (messageBus)
                await messageBus.emit('report-data', { data, testRun });
        };
    }
}
