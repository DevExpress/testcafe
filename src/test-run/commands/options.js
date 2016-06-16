// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import Assignable from '../../utils/assignable';
import { createBooleanValidator, createPositiveIntegerValidator } from './validations/factories';
import { ActionPositiveIntegerOptionError, ActionBooleanOptionError } from '../../errors/test-run';

export var positiveIntegerOption = createPositiveIntegerValidator(ActionPositiveIntegerOptionError);
export var booleanOption         = createBooleanValidator(ActionBooleanOptionError);


// Offset
export class OffsetOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this.offsetX = null;
        this.offsetY = null;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return [
            { name: 'offsetX', type: positiveIntegerOption },
            { name: 'offsetY', type: positiveIntegerOption }
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
            { name: 'modifiers.ctrl', type: booleanOption },
            { name: 'modifiers.alt', type: booleanOption },
            { name: 'modifiers.shift', type: booleanOption },
            { name: 'modifiers.meta', type: booleanOption }
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
            { name: 'caretPos', type: positiveIntegerOption }
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
        return super._getAssignableProperties().concat([{ name: 'replace', type: booleanOption }]);
    }
}

//ResizeToFitDevice
export class ResizeToFitDeviceOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this.portraitOrientation = false;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return [
            { name: 'portraitOrientation', type: booleanOption }
        ];
    }
}
