import Assignable from '../../utils/assignable';

export class CommandBase extends Assignable {
    constructor (obj, testRun, type, validateProperties = true) {
        super();

        this.type = type;

        this._assignFrom(obj, validateProperties, { testRun });
    }

    _getAssignableProperties () {
        return [];
    }
}

export class ActionCommandBase extends CommandBase {

}
