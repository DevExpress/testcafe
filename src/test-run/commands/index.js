import TYPE from './type';
import Assignable from '../../utils/assignable';
import {
    ActionSelectorTypeError,
    ActionOptionsTypeError,
    ActionIntegerOptionError,
    DragDestinationSelectorTypeError
} from '../../errors/test-run';

import { ClickOptions, MouseOptions } from './options';

// Validators
function selector (option, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionSelectorTypeError(type);
}

function dragDestinationSelector (option, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new DragDestinationSelectorTypeError(type);
}

function actionOptions (option, val) {
    var type = typeof val;

    if (type !== 'object' && val !== null && val !== void 0)
        throw new ActionOptionsTypeError(type);
}

function integer (option, val) {
    var valType = typeof val;

    if (valType !== 'number')
        throw new ActionIntegerOptionError(option, valType);

    var isInteger = !isNaN(val) &&
                    isFinite(val) &&
                    val === Math.floor(val);

    if (!isInteger)
        throw new ActionIntegerOptionError(option, val);
}

// Initializers
function initSelector (val) {
    return `(function () { return document.querySelector('${val}') })()`;
}

function initClickOptions (val) {
    return new ClickOptions(val, true);
}

function initMouseOptions (val) {
    return new MouseOptions(val, true);
}

// Commands
export class ClickCommand extends Assignable {
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

export class RightClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.rightClick;
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

export class DoubleClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.doubleClick;
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

export class HoverCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.hover;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

class DragCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type        = TYPE.drag;
        this.selector    = null;
        this.dragOffsetX = null;
        this.dragOffsetY = null;
        this.options     = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'dragOffsetX', type: integer, required: true },
            { name: 'dragOffsetY', type: integer, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

class DragToElementCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.dragToElement;

        this.selector            = null;
        this.destinationSelector = null;
        this.options             = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'destinationSelector', type: dragDestinationSelector, init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
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

    if (obj.type === TYPE.rightClick)
        return new RightClickCommand(obj);

    if (obj.type === TYPE.doubleClick)
        return new DoubleClickCommand(obj);

    if (obj.type === TYPE.hover)
        return new HoverCommand(obj);

    if (obj.type === TYPE.drag)
        return new DragCommand(obj);

    if (obj.type === TYPE.dragToElement)
        return new DragToElementCommand(obj);

    if (obj.type === TYPE.testDone)
        return new TestDoneCommand();
}

export function isTestDoneCommand (command) {
    return command.type === TYPE.testDone;
}

