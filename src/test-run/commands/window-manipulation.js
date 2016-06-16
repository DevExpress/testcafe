import TYPE from './type';
import Assignable from '../../utils/assignable';
import { isValidDeviceName } from 'testcafe-browser-natives';

import {
    ActionStringArgumentError,
    ActionBooleanArgumentError,
    ActionIntegerArgumentError,
    ActionPositiveIntegerArgumentError,
    ActionUnsupportedDeviceTypeError
} from '../../errors/test-run';


// Validators
function booleanArgument (name, val) {
    var valType = typeof val;

    if (valType !== 'boolean')
        throw new ActionBooleanArgumentError(name, valType);
}

function integerArgument (name, val, ErrorCtor = ActionIntegerArgumentError) {
    var valType = typeof val;

    if (valType !== 'number')
        throw new ErrorCtor(name, valType);

    var isInteger = !isNaN(val) &&
                    isFinite(val) &&
                    val === Math.floor(val);

    if (!isInteger)
        throw new ErrorCtor(name, val);
}

function positiveIntegerArgument (name, val) {
    integerArgument(name, val, ActionPositiveIntegerArgumentError);

    if (val < 0)
        throw new ActionPositiveIntegerArgumentError(name, val);
}

function nonEmptyStringArgument (argument, val, createError) {
    if (!createError)
        createError = actualValue => new ActionStringArgumentError(argument, actualValue);

    var type = typeof val;

    if (type !== 'string')
        throw createError(type);

    if (!val.length)
        throw createError('""');
}

function resizeWindowDeviceArgument (name, val) {
    nonEmptyStringArgument(name, val);

    if (!isValidDeviceName(val))
        throw new ActionUnsupportedDeviceTypeError(name, val);
}

// Commands
export class TakeScreenshotCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.takeScreenshot;
        this.path = '';

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'path', type: nonEmptyStringArgument }
        ];
    }
}

export class TakeScreenshotOnFailCommand {
    constructor () {
        this.type = TYPE.takeScreenshotOnFail;
    }
}

export class ResizeWindowCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type   = TYPE.resizeWindow;
        this.width  = 0;
        this.height = 0;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'width', type: positiveIntegerArgument, required: true },
            { name: 'height', type: positiveIntegerArgument, required: true }
        ];
    }
}

export class ResizeWindowToFitDeviceCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.resizeWindowToFitDevice;
        this.device   = null;
        this.portrait = false;
        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'device', type: resizeWindowDeviceArgument, required: true },
            { name: 'portrait', type: booleanArgument }
        ];
    }
}

