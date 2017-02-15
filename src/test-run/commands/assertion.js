import TYPE from './type';
import Assignable from '../../utils/assignable';
import { AssertionOptions } from './options';

import { stringArgument, actionOptions, assertionTypeArgument, numberArgument } from './validations/argument';

// Initializers
function initAssertionOptions (name, val) {
    return new AssertionOptions(val, true);
}

// Commands
export default class AssertionCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.assertion;

        this.assertionType = null;
        this.actual        = void 0;
        this.expected      = void 0;
        this.start         = void 0;
        this.finish        = void 0;
        this.message       = null;
        this.options       = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'assertionType', type: assertionTypeArgument, required: true },
            { name: 'actual' },
            { name: 'expected' },
            { name: 'start', type: numberArgument },
            { name: 'finish', type: numberArgument },
            { name: 'message', type: stringArgument },
            { name: 'options', type: actionOptions, init: initAssertionOptions, required: true }
        ];
    }
}
