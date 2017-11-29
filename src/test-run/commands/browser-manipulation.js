import TYPE from './type';
import Assignable from '../../utils/assignable';
import { ElementScreenshotOptions, ResizeToFitDeviceOptions } from './options';
import { initSelector } from './validations/initializers';

import {
    positiveIntegerArgument,
    nonEmptyStringArgument,
    resizeWindowDeviceArgument,
    actionOptions
} from './validations/argument';

import generateScreenshotMark from '../../screenshots/generate-mark';


function initResizeToFitDeviceOptions (name, val) {
    return new ResizeToFitDeviceOptions(val, true);
}

function initElementScreenshotOptions (name, val) {
    return new ElementScreenshotOptions(val, true);
}

// Commands
class TakeScreenshotBaseCommand extends Assignable {
    constructor (obj) {
        super(obj);

        Object.assign(this, generateScreenshotMark());

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [];
    }
}

export class TakeScreenshotCommand extends TakeScreenshotBaseCommand {
    constructor (obj) {
        super(obj);

        this.type = TYPE.takeScreenshot;
        this.path = '';

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'path', type: nonEmptyStringArgument }
        ]);
    }
}

export class TakeElementScreenshotCommand extends TakeScreenshotCommand {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.takeElementScreenshot;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', init: initElementScreenshotOptions, required: true }
        ]);
    }
}

export class TakeScreenshotOnFailCommand extends TakeScreenshotBaseCommand {
    constructor () {
        super();

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

export class MaximizeWindowCommand {
    constructor () {
        this.type = TYPE.maximizeWindow;
    }
}
