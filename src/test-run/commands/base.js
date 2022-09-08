import { nanoid } from 'nanoid';
import Assignable from '../../utils/assignable';

export class CommandBase extends Assignable {
    constructor (obj, testRun, type, validateProperties = true) {
        super();

        this.type = type;

        //NOTE: This is a service field for TestCafe Studio.
        //It is used during the test creation phase and does not affect the execution of the command.
        this.studio = {};

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
