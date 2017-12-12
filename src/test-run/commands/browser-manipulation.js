import TYPE from './type';
import Assignable from '../../utils/assignable';
import { ElementScreenshotsOptions, ResizeToFitDeviceOptions } from './options';
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

function initScreenshotOptions (name, val) {
    var { markData, markSeed } = generateScreenshotMark();

    return Object.assign({ screenshotMarkSeed: markSeed, screenshotMarkData: markData }, val);
}

function initElementScreenshotOptions (name, val) {
    return initScreenshotOptions(name, new ElementScreenshotsOptions(val));
}

// Commands
export class TakeScreenshotCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.takeScreenshot;
        this.path = '';
        this.options = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'path', type: nonEmptyStringArgument },
            { name: 'options', init: initScreenshotOptions, required: true }
        ];
    }
}

export class TakeElementScreenshotCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.takeElementScreenshot;
        this.selector = null;
        this.path     = '';
        this.options = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'path', type: nonEmptyStringArgument },
            { name: 'options', init: initElementScreenshotOptions, required: true }
        ];
    }
}

export class TakeScreenshotOnFailCommand {
    constructor () {
        this.type = TYPE.takeScreenshotOnFail;

        this._assignFrom({});
    }

    _getAssignableProperties () {
        return [
            { name: 'options', init: initScreenshotOptions, required: true }
        ];
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
