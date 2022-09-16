import { nanoid } from 'nanoid';
import Assignable from '../../utils/assignable';

const COMMON_NOT_REPORTED_PROPERTIES = ['studio'];

export class CommandBase extends Assignable {
    constructor (obj, testRun, type, validateProperties = true) {
        super();

        this.type     = type;
        this.actionId = obj?.actionId || nanoid(7);

        this._assignFrom(obj, validateProperties, { testRun });
    }

    getAssignableProperties () {
        return [];
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
