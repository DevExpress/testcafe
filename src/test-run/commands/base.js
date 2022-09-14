import { nanoid } from 'nanoid';
import Assignable from '../../utils/assignable';
import { objectOption } from './options';

const COMMON_NOT_REPORTED_PROPERTIES = ['studio'];

export class CommandBase extends Assignable {
    constructor (obj, testRun, type, validateProperties = true) {
        super();

        this.type     = type;
        this.actionId = obj?.actionId || nanoid(7);

        this._assignFrom(obj, validateProperties, { testRun });
    }

    //NOTE: This is a service field for TestCafe Studio.
    //It is used during the test creation phase and does not affect the execution of the command.
    getAssignableProperties () {
        return [
            { name: 'studio', type: objectOption, required: false },
        ];
    }

    getNonReportedProperties () {
        return COMMON_NOT_REPORTED_PROPERTIES;
    }
}

export class ActionCommandBase extends CommandBase {
    static methodName = 'actionCommandBase';

    get methodName () {
        return this.constructor.methodName;
    }
}
