import { nanoid } from 'nanoid';
import Assignable from '../../utils/assignable';
import { objectOption } from './options';

export class CommandBase extends Assignable {
    constructor (obj, testRun, type, validateProperties = true) {
        super();

        this.type = type;

        this._assignFrom(obj, validateProperties, { testRun });

        this.actionId = obj?.actionId || nanoid(7);
    }

    //NOTE: This is a service field for TestCafe Studio.
    //It is used during the test creation phase and does not affect the execution of the command.
    _getAssignableProperties () {
        return [
            { name: 'studio', type: objectOption, required: false },
        ];
    }
}

export class ActionCommandBase extends CommandBase {
    static methodName = 'actionCommandBase';

    get methodName () {
        return this.constructor.methodName;
    }
}
