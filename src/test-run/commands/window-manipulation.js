import TYPE from './type';
import Assignable from '../../utils/assignable';

import {
    booleanArgument,
    positiveIntegerArgument,
    nonEmptyStringArgument,
    resizeWindowDeviceArgument
} from './prop-validations/argument';


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

