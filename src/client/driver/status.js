import Assignable from '../../utils/assignable';

export default class DriverStatus extends Assignable {
    constructor (obj) {
        super(obj);

        this.isCommandResult = false;
        this.executionError  = null;
        this.pageError       = null;
        this.result          = null;

        this._assignFrom(obj, true);
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
