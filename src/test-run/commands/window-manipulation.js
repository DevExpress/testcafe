import TYPE from './type';
import Assignable from '../../utils/assignable';
import { ResizeToFitDeviceOptions } from './options';

import {
    positiveIntegerArgument,
    nonEmptyStringArgument,
    resizeWindowDeviceArgument,
    actionOptions
} from './validations/argument';


function initResizeToFitDeviceOptions (val) {
    return new ResizeToFitDeviceOptions(val, true);
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

        this.type    = TYPE.resizeWindowToFitDevice;
        this.device  = null;
        this.options = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'device', type: resizeWindowDeviceArgument, required: true },
            { name: 'options', type: actionOptions, init: initResizeToFitDeviceOptions, required: true }
        ];
    }
}
