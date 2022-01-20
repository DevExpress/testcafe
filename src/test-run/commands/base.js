import { nanoid } from 'nanoid';
import Assignable from '../../utils/assignable';

export class CommandBase extends Assignable {
    constructor (obj, testRun, type, validateProperties = true) {
        super();

        this.type = type;

        this._assignFrom(obj, validateProperties, { testRun });

        this.actionId = obj?.actionId || nanoid(7);
    }

    _getAssignableProperties () {
        return [];
    }
}

export class ActionCommandBase extends CommandBase {
    static methodName = 'actionCommandBase';

    get methodName () {
        return this.constructor.methodName;
    }
}
