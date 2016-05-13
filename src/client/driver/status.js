import Assignable from '../../utils/assignable';
import { nativeMethods } from './deps/hammerhead';


export default class DriverStatus extends Assignable {
    constructor (obj) {
        super(obj);

        this.id              = DriverStatus._generateId();
        this.isCommandResult = false;
        this.executionError  = null;
        this.pageError       = null;
        this.result          = null;

        this._assignFrom(obj, true);
    }

    static _generateId () {
        if (typeof nativeMethods.performanceNow === 'function')
            return nativeMethods.performanceNow().toString();

        return (nativeMethods.dateNow() + Math.random()).toString();
    }

    _getAssignableProperties () {
        return [
            { name: 'isCommandResult' },
            { name: 'executionError' },
            { name: 'pageError' },
            { name: 'result' }
        ];
    }
}
