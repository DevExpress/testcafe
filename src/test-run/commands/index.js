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

// Initializers
function initSelector (val) {
    return `(function () { return document.querySelector('${val}') })()`;
}

function initClickOptions (val) {
    return new ClickOptions(val, true);
}

// Commands
class ClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.click;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class TestDoneCommand {
    constructor () {
        this.type = TYPE.testDone;
    }
}

// Factory
export function createCommandFromObject (obj) {
    if (obj.type === TYPE.click)
        return new ClickCommand(obj);

    if (obj.type === TYPE.testDone)
        return new TestDoneCommand();
}

