// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import Assignable from '../../utils/assignable';
import {
    createBooleanValidator,
    createIntegerValidator,
    createPositiveIntegerValidator,
    createSpeedValidator
} from './validations/factories';
import {
    ActionIntegerOptionError,
    ActionPositiveIntegerOptionError,
    ActionBooleanOptionError,
    ActionSpeedOptionError
} from '../../errors/test-run';

export var integerOption         = createIntegerValidator(ActionIntegerOptionError);
export var positiveIntegerOption = createPositiveIntegerValidator(ActionPositiveIntegerOptionError);
export var booleanOption         = createBooleanValidator(ActionBooleanOptionError);
export var speedOption           = createSpeedValidator(ActionSpeedOptionError);


// Acitons
export class ActionOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this.speed = null;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return [
            { name: 'speed', type: speedOption }
        ];
    }
}

// Offset
export class OffsetOptions extends ActionOptions {
    constructor (obj, validate) {
        super();

        this.offsetX = null;
        this.offsetY = null;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'offsetX', type: integerOption },
            { name: 'offsetY', type: integerOption }
        ]);
    }
}

export class ScrollOptions extends OffsetOptions {
    constructor (obj, validate) {
        super();

        this.scrollToCenter   = false;
        this.skipParentFrames = false;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'scrollToCenter', type: booleanOption },
            { name: 'skipParentFrames', type: booleanOption }
        ]);
    }
}

// Element Screenshot
export class ElementScreenshotOptions extends ActionOptions {
    constructor (obj, validate) {
        super();

        this.scrollTargetX   = null;
        this.scrollTargetY   = null;
        this.includeMargins  = false;
        this.includeBorders  = true;
        this.includePaddings = true;

        this.crop = {
            left:   null,
            right:  null,
            top:    null,
            bottom: null
        };

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'scrollTargetX', type: integerOption },
            { name: 'scrollTargetY', type: integerOption },
            { name: 'crop.left', type: integerOption },
            { name: 'crop.right', type: integerOption },
            { name: 'crop.top', type: integerOption },
            { name: 'crop.bottom', type: integerOption },
            { name: 'includeMargins', type: booleanOption },
            { name: 'includeBorders', type: booleanOption },
            { name: 'includePaddings', type: booleanOption }
        ]);
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

        this.speed          = null;
        this.minMovingTime  = null;
        this.holdLeftButton = false;
        this.skipScrolling  = false;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'speed' },
            { name: 'minMovingTime' },
            { name: 'holdLeftButton' },
            { name: 'skipScrolling', type: booleanOption }
        ]);
    }
}

// Type
export class TypeOptions extends ClickOptions {
    constructor (obj, validate) {
        super();

        this.replace = false;
        this.paste   = false;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'replace', type: booleanOption },
            { name: 'paste', type: booleanOption }
        ]);
    }
}

// DragToElement
export class DragToElementOptions extends MouseOptions {
    constructor (obj, validate) {
        super(obj, validate);

        this.destinationOffsetX = null;
        this.destinationOffsetY = null;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'destinationOffsetX', type: integerOption },
            { name: 'destinationOffsetY', type: integerOption }
        ]);
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

//Assertion
export class AssertionOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this.timeout               = void 0;
        this.allowUnawaitedPromise = false;

        this._assignFrom(obj, validate);
    }

    _getAssignableProperties () {
        return [
            { name: 'timeout', type: positiveIntegerOption },
            { name: 'allowUnawaitedPromise', type: booleanOption }
        ];
    }
}
