import Assignable from '../../utils/assignable';

export default class CommandBase extends Assignable {
    constructor (obj, testRun, type, validateProperties = true) {
        super();

        this.type = type;

        this._assignFrom(obj, validateProperties, { testRun });
    }

    _getAssignableProperties () {
        return [];
    }
}
