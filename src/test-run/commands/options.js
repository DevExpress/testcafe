// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

import Assignable from '../../utils/assignable';
import {
    createBooleanValidator,
    createIntegerValidator,
    createPositiveIntegerValidator,
    createSpeedValidator,
    createStringValidator,
    createDateValidator,
    createNumberValidator,
    createUrlValidator,
    createUrlSearchParamsValidator,
    createObjectValidator,
    createStringOrRegexValidator,
    createFunctionValidator,
} from './validations/factories';
import {
    ActionIntegerOptionError,
    ActionPositiveIntegerOptionError,
    ActionBooleanOptionError,
    ActionSpeedOptionError,
    ActionStringOptionError,
    ActionDateOptionError,
    ActionNumberOptionError,
    ActionUrlOptionError,
    ActionUrlSearchParamsOptionError,
    ActionObjectOptionError,
    ActionStringOrRegexOptionError,
    ActionFunctionOptionError,
} from '../../shared/errors';

export const integerOption         = createIntegerValidator(ActionIntegerOptionError);
export const positiveIntegerOption = createPositiveIntegerValidator(ActionPositiveIntegerOptionError);
export const booleanOption         = createBooleanValidator(ActionBooleanOptionError);
export const speedOption           = createSpeedValidator(ActionSpeedOptionError);
export const stringOption          = createStringValidator(ActionStringOptionError);
export const stringOrRegexOption   = createStringOrRegexValidator(ActionStringOrRegexOptionError);
export const dateOption            = createDateValidator(ActionDateOptionError);
export const numberOption          = createNumberValidator(ActionNumberOptionError);
export const urlOption             = createUrlValidator(ActionUrlOptionError);
export const urlSearchParamsOption = createUrlSearchParamsValidator(ActionUrlSearchParamsOptionError);
export const objectOption          = createObjectValidator(ActionObjectOptionError);
export const functionOption        = createFunctionValidator(ActionFunctionOptionError);

// Actions
export class ActionOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this.speed = null;

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'speed', type: speedOption },
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

    getAssignableProperties () {
        return [
            { name: 'offsetX', type: integerOption },
            { name: 'offsetY', type: integerOption },
            { name: 'isDefaultOffset', type: booleanOption },
        ];
    }
}

export class ScrollOptions extends OffsetOptions {
    constructor (obj, validate) {
        super();

        this.scrollToCenter   = false;
        this.skipParentFrames = false;

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'scrollToCenter', type: booleanOption },
            { name: 'skipParentFrames', type: booleanOption },
        ];
    }
}

export class CropOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'left', type: integerOption, defaultValue: null },
            { name: 'right', type: integerOption, defaultValue: null },
            { name: 'top', type: integerOption, defaultValue: null },
            { name: 'bottom', type: integerOption, defaultValue: null },
        ];
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
            bottom: null,
        };

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'scrollTargetX', type: integerOption },
            { name: 'scrollTargetY', type: integerOption },
            { name: 'crop', type: objectOption, init: initCropOptions },
            { name: 'includeMargins', type: booleanOption },
            { name: 'includeBorders', type: booleanOption },
            { name: 'includePaddings', type: booleanOption },
        ];
    }
}

export class ModifiersOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'ctrl', type: booleanOption, defaultValue: false },
            { name: 'alt', type: booleanOption, defaultValue: false },
            { name: 'shift', type: booleanOption, defaultValue: false },
            { name: 'meta', type: booleanOption, defaultValue: false },
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
            meta:  false,
        };

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'modifiers', type: objectOption, init: initModifiersOptions },
        ];
    }
}


// Click
export class ClickOptions extends MouseOptions {
    constructor (obj, validate) {
        super();

        this.caretPos = null;

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'caretPos', type: positiveIntegerOption },
        ];
    }
}

// Move
export class MoveOptions extends MouseOptions {
    constructor (obj, validate) {
        super();

        this.speed                   = null;
        this.minMovingTime           = null;
        this.holdLeftButton          = false;
        this.skipScrolling           = false;
        this.skipDefaultDragBehavior = false;

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'speed' },
            { name: 'minMovingTime' },
            { name: 'holdLeftButton' },
            { name: 'skipScrolling', type: booleanOption },
            { name: 'skipDefaultDragBehavior', type: booleanOption },
        ];
    }
}

// Type
export class TypeOptions extends ClickOptions {
    constructor (obj, validate) {
        super();

        this.replace      = false;
        this.paste        = false;
        this.confidential = void 0;

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'replace', type: booleanOption },
            { name: 'paste', type: booleanOption },
            { name: 'confidential', type: booleanOption },
        ];
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

    getAssignableProperties () {
        return [
            { name: 'destinationOffsetX', type: integerOption },
            { name: 'destinationOffsetY', type: integerOption },
        ];
    }
}

//ResizeToFitDevice
export class ResizeToFitDeviceOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this.portraitOrientation = false;

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'portraitOrientation', type: booleanOption },
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

    getAssignableProperties () {
        return [
            { name: 'timeout', type: positiveIntegerOption },
            { name: 'allowUnawaitedPromise', type: booleanOption },
        ];
    }
}

// Press
export class PressOptions extends ActionOptions {
    constructor (obj, validate) {
        super();

        this.confidential = void 0;

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'confidential', type: booleanOption },
        ];
    }
}

// Cookie
export class CookieOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'name', type: stringOption },
            { name: 'value', type: stringOption },
            { name: 'domain', type: stringOption },
            { name: 'path', type: stringOption },
            { name: 'expires', type: dateOption },
            { name: 'maxAge', type: numberOption },
            { name: 'secure', type: booleanOption },
            { name: 'httpOnly', type: booleanOption },
            { name: 'sameSite', type: stringOption },
        ];
    }
}

export class RequestAuthOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'username', type: stringOption, required: true },
            { name: 'password', type: stringOption },
        ];
    }
}

export class RequestProxyOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'protocol', type: stringOption },
            { name: 'host', type: stringOption, required: true },
            { name: 'port', type: numberOption, required: true },
            { name: 'auth', type: objectOption, init: initRequestAuthOption },
        ];
    }
}

export class RequestOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'url', type: urlOption },
            { name: 'method', type: stringOption },
            { name: 'headers', type: objectOption },
            { name: 'params', type: urlSearchParamsOption },
            { name: 'body' },
            { name: 'timeout', type: numberOption },
            { name: 'withCredentials', type: booleanOption },
            { name: 'auth', type: objectOption, init: initRequestAuthOption },
            { name: 'proxy', type: objectOption, init: initRequestProxyOptions },
            { name: 'rawResponse', type: booleanOption },
        ];
    }
}

export class GetProxyUrlOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'credentials', type: numberOption },
        ];
    }
}

export class SkipJsErrorsOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'stack', type: stringOrRegexOption, required: false },
            { name: 'message', type: stringOrRegexOption, required: false },
            { name: 'pageUrl', type: stringOrRegexOption, required: false },
        ];
    }
}
export class SkipJsErrorsCallbackWithOptions extends Assignable {
    constructor (obj, validate) {
        super();

        this._assignFrom(obj, validate);
    }

    getAssignableProperties () {
        return [
            { name: 'fn', type: functionOption, required: true },
            { name: 'dependencies', type: objectOption, required: false },
        ];
    }
}

// Initializers
function initRequestAuthOption (name, val, initOptions, validate = true) {
    return new RequestAuthOptions(val, validate);
}

function initRequestProxyOptions (name, val, initOptions, validate = true) {
    return new RequestProxyOptions(val, validate);
}

function initCropOptions (name, val, initOptions, validate = true) {
    return new CropOptions(val, validate);
}

function initModifiersOptions (name, val, initOptions, validate = true) {
    return new ModifiersOptions(val, validate);
}
