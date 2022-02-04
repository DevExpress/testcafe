import { nanoid } from 'nanoid';
import Assignable from '../utils/assignable';


export interface DriverStatusInitialData {
    isCommandResult?: boolean;
    executionError?: any;
    pageError?: any;
    result?: any;
    consoleMessages?: any;
    isPendingWindowSwitching?: boolean;
    isObservingFileDownloadingInNewWindow?: boolean;
    isFirstRequestAfterWindowSwitching?: boolean;
}

// @ts-ignore
export default class DriverStatus extends Assignable {
    public id: string;
    public isCommandResult = false;
    public executionError: any;
    public pageError: any;
    public resent = false;
    public result: any;
    public consoleMessages: any;
    public isPendingWindowSwitching = false;
    public isObservingFileDownloadingInNewWindow = false;
    public isFirstRequestAfterWindowSwitching = false;
    public debug: string;

    public constructor (obj: DriverStatusInitialData) {
        super();

        this.id              = nanoid(7); //generateId();
        this.executionError  = null;
        this.pageError       = null;
        this.result          = null;
        this.consoleMessages = null;
        this.debug           = '';

        this._assignFrom(obj, true);
    }

    protected _getAssignableProperties (): { name: string }[] {
        return [
            { name: 'isCommandResult' },
            { name: 'executionError' },
            { name: 'pageError' },
            { name: 'result' },
            { name: 'consoleMessages' },
            { name: 'isPendingWindowSwitching' },
            { name: 'isObservingFileDownloadingInNewWindow' },
            { name: 'isFirstRequestAfterWindowSwitching' },
        ];
    }
}
