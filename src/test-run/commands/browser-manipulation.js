import TYPE from './type';
import { ActionCommandBase } from './base';
import { ElementScreenshotOptions, ResizeToFitDeviceOptions } from './options';
import { initSelector } from './validations/initializers';

import {
    booleanArgument,
    positiveIntegerArgument,
    screenshotPathArgument,
    resizeWindowDeviceArgument,
    actionOptions,
    stringArgument,
} from './validations/argument';

import { generateScreenshotMark } from '../../screenshots/utils';
import { camelCase } from 'lodash';

function initResizeToFitDeviceOptions (name, val, initOptions, validate = true) {
    return new ResizeToFitDeviceOptions(val, validate);
}

function initElementScreenshotOptions (name, val, initOptions, validate = true) {
    return new ElementScreenshotOptions(val, validate);
}

// Commands
export class TakeScreenshotBaseCommand extends ActionCommandBase {
    constructor (obj, testRun, type, validateProperties) {
        super(obj, testRun, type, validateProperties);

        this.markSeed = null;
        this.markData = '';
    }

    generateScreenshotMark () {
        Object.assign(this, generateScreenshotMark());
    }
}

export class TakeScreenshotCommand extends TakeScreenshotBaseCommand {
    static methodName = camelCase(TYPE.takeScreenshot);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.takeScreenshot, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'path', type: screenshotPathArgument, defaultValue: '' },
            { name: 'fullPage', type: booleanArgument, defaultValue: void 0 },
            { name: 'thumbnails', type: booleanArgument, defaultValue: void 0 },
        ];
    }
}

export class TakeElementScreenshotCommand extends TakeScreenshotBaseCommand {
    static methodName = camelCase(TYPE.takeElementScreenshot);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.takeElementScreenshot, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', init: initElementScreenshotOptions, required: true },
            { name: 'path', type: screenshotPathArgument, defaultValue: '' },
        ];
    }
}

export class TakeScreenshotOnFailCommand extends TakeScreenshotBaseCommand {
    static methodName = camelCase(TYPE.takeScreenshotOnFail);

    constructor (obj, testRun) {
        super(obj, testRun, TYPE.takeScreenshotOnFail);
    }

    getAssignableProperties () {
        return [
            { name: 'fullPage', type: booleanArgument, defaultValue: false },
            { name: 'failedActionId', type: stringArgument },
        ];
    }
}

export class ResizeWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.resizeWindow);

    constructor (obj, testRun) {
        super(obj, testRun, TYPE.resizeWindow);
    }

    getAssignableProperties () {
        return [
            { name: 'width', type: positiveIntegerArgument, required: true },
            { name: 'height', type: positiveIntegerArgument, required: true },
        ];
    }
}

export class ResizeWindowToFitDeviceCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.resizeWindowToFitDevice);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.resizeWindowToFitDevice, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'device', type: resizeWindowDeviceArgument, required: true },
            { name: 'options', type: actionOptions, init: initResizeToFitDeviceOptions, required: true },
        ];
    }
}

export class MaximizeWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.maximizeWindow);

    constructor () {
        super();
        this.type = TYPE.maximizeWindow;
    }
}
