// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import Assignable from '../../utils/assignable';

import {
    ActionNumberOptionError,
    ActionPositiveNumberOptionError,
    ActionBooleanOptionError
} from '../../errors/test-run';

// Validators
function number (option, val, positive) {
    var valType   = typeof val;
    var ErrorCtor = positive ? ActionPositiveNumberOptionError : ActionNumberOptionError;

    if (valType !== 'number')
        throw new ErrorCtor(option, valType);

    if (isNaN(val))
        throw new ErrorCtor(option, valType);
}

function positiveNumber (option, val) {
    number(option, val, true);

    if (val < 0)
        throw new ActionPositiveNumberOptionError(option, val, true);
}

function positiveNumberOrNull (option, val) {
    if (val === null)
        return;

    positiveNumber(option, val);
}

function boolean (option, val) {
    var valType = typeof val;

    if (valType !== 'boolean')
        throw new ActionBooleanOptionError(option, valType);
}

// Select
export class SelectOptions extends Assignable {
    constructor (obj, validate) {
        super();

        // NOTE: start and end positions can be defined by integer values (for 'inputs'
        // and 'textareas') or {node, offset} objects (for contentEditable elements)
        this.startPos = null; // TODO
        this.endPos = null;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return [
            { name: 'startPos' },
            { name: 'endPos' }
        ];
    }
}


// Offset
export class OffsetOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this.offsetX = 0;
        this.offsetY = 0;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return [
            { name: 'offsetX', type: positiveNumber },
            { name: 'offsetY', type: positiveNumber }
        ];
    }
}


// Mouse
export class MouseOptions extends OffsetOptions {
    constructor (obj, validate) {
        super();

        this.modifiers = {
            ctrl:  false,
            alt:   false,
            shift: false,
            meta:  false
        };

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'modifiers.ctrl', type: boolean },
            { name: 'modifiers.alt', type: boolean },
            { name: 'modifiers.shift', type: boolean },
            { name: 'modifiers.meta', type: boolean }
        ]);
    }
}


// Click
export class ClickOptions extends MouseOptions {
    constructor (obj, validate) {
        super();

        this.caretPos = null;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'caretPos', type: positiveNumberOrNull }
        ]);
    }
}


// Drag
export class DragOptions extends MouseOptions {
    constructor (obj, validate) {
        super();

        this.destinationElement = null; // TODO
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'destinationElement' },
            { name: 'dragOffsetX', type: number },
            { name: 'dragOffsetY', type: number }
        ]);
    }
}


// Move
export class MoveOptions extends MouseOptions {
    constructor (obj, validate) {
        super();

        this.speed         = null;
        this.minMovingTime = null;
        this.dragMode      = false;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'speed' },
            { name: 'minMovingTime' },
            { name: 'dragMode' }
        ]);
    }
}

// Type
export class TypeOptions extends ClickOptions {
    constructor (obj, validate) {
        super();

        this.replace = false;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([{ name: 'replace', type: boolean }]);
    }
}
