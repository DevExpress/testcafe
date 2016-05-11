import TYPE from './type';
import Assignable from '../../utils/assignable';
import {
    ActionSelectorTypeError,
    ActionOptionsTypeError,
    ActionStringArgumentError,
    ActionIntegerArgumentError,
    ActionPositiveIntegerArgumentError,
    ActionAdditionalSelectorTypeError
} from '../../errors/test-run';

import { ClickOptions, MouseOptions, TypeOptions } from './options';


// Validators
function selector (name, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionSelectorTypeError(type);
}

function selectActionSelector (name, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionAdditionalSelectorTypeError(name, type);
}

function dragDestinationSelector (name, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionAdditionalSelectorTypeError(name, type);
}

function actionOptions (name, val) {
    var type = typeof val;

    if (type !== 'object' && val !== null && val !== void 0)
        throw new ActionOptionsTypeError(type);
}

function integerArgument (name, val, positive) {
    var valType   = typeof val;
    var ErrorCtor = positive ? ActionPositiveIntegerArgumentError : ActionIntegerArgumentError;

    if (valType !== 'number')
        throw new ErrorCtor(name, valType);

    var isInteger = !isNaN(val) &&
                    isFinite(val) &&
                    val === Math.floor(val);

    if (!isInteger)
        throw new ErrorCtor(name, val);
}

function positiveIntegerArgument (name, val) {
    integerArgument(name, val, true);

    if (val < 0)
        throw new ActionPositiveIntegerArgumentError(name, val);
}

function nonEmptyStringArgument (option, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionStringArgumentError(option, type);

    if (!val.length)
        throw new ActionStringArgumentError(option);
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

function initTypeOptions (val) {
    return new TypeOptions(val, true);
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

export class TypeTextCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.typeText;
        this.selector = null;
        this.text     = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'text', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initTypeOptions, required: true }
        ];
    }
}

export class DragCommand extends Assignable {
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
            { name: 'dragOffsetX', type: integerArgument, required: true },
            { name: 'dragOffsetY', type: integerArgument, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class DragToElementCommand extends Assignable {
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

export class SelectTextCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.selectText;
        this.selector = null;
        this.startPos = null;
        this.endPos   = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'startPos', type: positiveIntegerArgument },
            { name: 'endPos', type: positiveIntegerArgument }
        ];
    }
}

export class SelectEditableContentCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type          = TYPE.selectEditableContent;
        this.startSelector = null;
        this.endSelector   = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'startSelector', type: selectActionSelector, init: initSelector, required: true },
            { name: 'endSelector', type: selectActionSelector, init: initSelector }
        ];
    }
}

export class SelectTextAreaContentCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type      = TYPE.selectTextAreaContent;
        this.selector  = null;
        this.startLine = null;
        this.startPos  = null;
        this.endLine   = null;
        this.endPos    = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'startLine', type: positiveIntegerArgument },
            { name: 'startPos', type: positiveIntegerArgument },
            { name: 'endLine', type: positiveIntegerArgument },
            { name: 'endPos', type: positiveIntegerArgument }
        ];
    }
}

export class PressKeyCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.pressKey;
        this.keys = '';

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'keys', type: nonEmptyStringArgument, required: true }
        ];
    }
}

export class ExecuteHybridFunctionCommand {
    constructor (fnCode, args) {
        this.type   = TYPE.execHybridFn;
        this.fnCode = fnCode;
        this.args   = args;
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

    if (obj.type === TYPE.typeText)
        return new TypeTextCommand(obj);

    if (obj.type === TYPE.selectText)
        return new SelectTextCommand(obj);

    if (obj.type === TYPE.selectTextAreaContent)
        return new SelectTextAreaContentCommand(obj);

    if (obj.type === TYPE.selectEditableContent)
        return new SelectEditableContentCommand(obj);

    if (obj.type === TYPE.pressKey)
        return new PressKeyCommand(obj);

    if (obj.type === TYPE.testDone)
        return new TestDoneCommand();
}

export function isTestDoneCommand (command) {
    return command.type === TYPE.testDone;
}

export function isCommandRejectableByPageError (command) {
    return !isTestDoneCommand(command) && command.type !== TYPE.execHybridFn;
}

