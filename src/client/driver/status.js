import Assignable from '../../utils/assignable';
import generateId from './generate-id';


export default class DriverStatus extends Assignable {
    constructor (obj) {
        super(obj);

        this.id                                    = generateId();
        this.isCommandResult                       = false;
        this.executionError                        = null;
        this.pageError                             = null;
        this.resent                                = false;
        this.result                                = null;
        this.consoleMessages                       = null;
        this.isPendingWindowSwitching              = false;
        this.isObservingFileDownloadingInNewWindow = false;
        this.isFirstRequestAfterWindowSwitching    = false;
        this.debug                                 = '';
        this.warnings                              = null;

        this._assignFrom(obj, true);
    }

    getAssignableProperties () {
        return [
            { name: 'isCommandResult' },
            { name: 'executionError' },
            { name: 'pageError' },
            { name: 'result' },
            { name: 'consoleMessages' },
            { name: 'isPendingWindowSwitching' },
            { name: 'isObservingFileDownloadingInNewWindow' },
            { name: 'isFirstRequestAfterWindowSwitching' },
            { name: 'warnings' },
        ];
    }
}
