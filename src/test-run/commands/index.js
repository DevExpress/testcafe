import TYPE from './type';
import Assignable from '../../utils/assignable';
import { ActionSelectorTypeError, ActionOptionsTypeError } from '../../errors/test-run';
import { ClickOptions } from './options';

// Validators
function selector (option, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionSelectorTypeError(type);
}

function actionOptions (option, val) {
    var type = typeof val;

    if (type !== 'object' && val !== null && val !== void 0)
        throw new ActionOptionsTypeError(type);
}

// Commands
export class Click extends Assignable {
    constructor (obj) {
        super(obj);

        this.type      = TYPE.click;
        this.arguments = {
            selector: null,
            options:  {}
        };

        this._assignFrom(obj, true);

        this.arguments.selector = `(function () { return document.querySelector('${this.arguments.selector}') })()`;
        this.arguments.options  = new ClickOptions(this.arguments.options, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'arguments.selector', type: selector },
            { name: 'arguments.options', type: actionOptions }
        ];
    }
}

export class TestDone {
    constructor () {
        this.type = TYPE.testDone;
    }
}

// Factory
export function createCommandFromObject (obj) {
    if (obj.type === TYPE.click)
        return new Click(obj);

    if (obj.type === TYPE.testDone)
        return new TestDone();
}

