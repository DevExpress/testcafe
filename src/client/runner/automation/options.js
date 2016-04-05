// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import {
    ActionNumberOptionError,
    ActionPositiveNumberOptionError,
    ActionBooleanOptionError
    } from '../../../errors/test-run';

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

function boolean (option, val) {
    var valType = typeof val;

    if (valType !== 'boolean')
        throw new ActionBooleanOptionError(option, valType);
}

// Base
class Options {
    _getAssignableProperties () {
        throw new Error('Not implemented');
    }

    _assignFrom (obj, validate) {
        var props = this._getAssignableProperties();

        for (var i = 0; i < props.length; i++) {
            var name      = props[i].name;
            var validator = props[i].type;
            var path      = name.split('.');
            var lastIdx   = path.length - 1;
            var last      = path[lastIdx];
            var srcObj    = obj;
            var destObj   = this;

            for (var j = 0; j < lastIdx && srcObj && destObj; j++) {
                srcObj  = srcObj[path[j]];
                destObj = destObj[path[j]];
            }

            if (srcObj && destObj) {
                var srcVal = srcObj[last];

                if (srcVal !== void 0) {
                    if (validate && validator)
                        validator(name, srcVal);

                    destObj[last] = srcVal;
                }
            }
        }
    }
}


// Select
export class SelectOptions extends Options {
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
export class OffsetOptions extends Options {
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
            { name: 'caretPos', type: positiveNumber }
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
