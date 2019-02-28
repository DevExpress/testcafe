import TYPE from './type';
import CommandBase from './base';
import { ElementScreenshotOptions, ResizeToFitDeviceOptions } from './options';
import { initSelector } from './validations/initializers';

import {
    positiveIntegerArgument,
    screenshotPathArgument,
    resizeWindowDeviceArgument,
    actionOptions
} from './validations/argument';

import { generateScreenshotMark } from '../../screenshots/utils';

function initResizeToFitDeviceOptions (name, val) {
    return new ResizeToFitDeviceOptions(val, true);
}

function initElementScreenshotOptions (name, val) {
    return new ElementScreenshotOptions(val, true);
}

// Commands
class TakeScreenshotBaseCommand extends CommandBase {
    constructor (obj, testRun, type) {
        super(obj, testRun, type);

        this.markSeed = null;
        this.markData = '';
    }

    generateScreenshotMark () {
        Object.assign(this, generateScreenshotMark());
    }
}

export class TakeScreenshotCommand extends TakeScreenshotBaseCommand {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.takeScreenshot);
    }

    _getAssignableProperties () {
        return [
            { name: 'path', type: screenshotPathArgument, defaultValue: '' }
        ];
    }
}

export class TakeElementScreenshotCommand extends TakeScreenshotBaseCommand {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.takeElementScreenshot);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', init: initElementScreenshotOptions, required: true },
            { name: 'path', type: screenshotPathArgument, defaultValue: '' }
        ];
    }
}

export class TakeScreenshotOnFailCommand extends TakeScreenshotBaseCommand {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.takeScreenshotOnFail);
    }

    _getAssignableProperties () {
        return [];
    }
}

export class ResizeWindowCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.resizeWindow);
    }

    _getAssignableProperties () {
        return [
            { name: 'width', type: positiveIntegerArgument, required: true },
            { name: 'height', type: positiveIntegerArgument, required: true }
        ];
    }
}

export class ResizeWindowToFitDeviceCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.resizeWindowToFitDevice);
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
