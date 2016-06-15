import TYPE from './type';
import Assignable from '../../utils/assignable';
import { isValidDeviceName } from 'testcafe-browser-natives';

import {
    ActionSelectorTypeError,
    ActionOptionsTypeError,
    ActionStringArgumentError,
    ActionIntegerArgumentError,
    ActionPositiveIntegerArgumentError,
    ActionAdditionalSelectorTypeError,
    ActionUnsupportedUrlProtocolError,
    ActionStringOrStringArrayArgumentError,
    ActionStringArrayElementError,
    ActionUnsupportedDeviceTypeError
} from '../../errors/test-run';

import { ClickOptions, MouseOptions, TypeOptions, ResizeToFitDeviceOptions } from './options';


const PROTOCOL_RE           = /^([\w-]+?)(?=\:)/;
const SUPPORTED_PROTOCOL_RE = /^https?/i;


// Validators
function selector (name, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionSelectorTypeError(type);
}

function selectActionSelector (name, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionAdditionalSelectorTypeError(name, type);
}

function dragDestinationSelector (name, val) {
    var type = typeof val;

    if (type !== 'string')
        throw new ActionAdditionalSelectorTypeError(name, type);
}

function actionOptions (name, val) {
    var type = typeof val;

    if (type !== 'object' && val !== null && val !== void 0)
        throw new ActionOptionsTypeError(type);
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

function navigateToUrlArgument (name, val) {
    nonEmptyStringArgument(name, val);

    var url      = val.trim();
    var protocol = url.match(PROTOCOL_RE);

    if (protocol && !SUPPORTED_PROTOCOL_RE.test(protocol[0]))
        throw new ActionUnsupportedUrlProtocolError(name, protocol[0]);
}

function resizeWindowDeviceArgument (name, val) {
    nonEmptyStringArgument(name, val);

    if (!isValidDeviceName(val))
        throw new ActionUnsupportedDeviceTypeError(name, val);
}

function stringOrStringArrayArgument (argument, val) {
    var type = typeof val;

    if (type === 'string') {
        if (!val.length)
            throw new ActionStringOrStringArrayArgumentError(argument, '""');
    }
    else if (Array.isArray(val)) {
        if (!val.length)
            throw new ActionStringOrStringArrayArgumentError(argument, '[]');

        var validateElement = elementIndex => nonEmptyStringArgument(
            argument,
            val[elementIndex],
            actualValue => new ActionStringArrayElementError(argument, actualValue, elementIndex)
        );

        for (var i = 0; i < val.length; i++)
            validateElement(i);
    }
    else
        throw new ActionStringOrStringArrayArgumentError(argument, type);
}

// Initializers
function initSelector (val) {
    return `(function () { return document.querySelector('${val}') })()`;
}

function initClickOptions (val) {
    return new ClickOptions(val, true);
}

function initMouseOptions (val) {
    return new MouseOptions(val, true);
}

function initTypeOptions (val) {
    return new TypeOptions(val, true);
}

function initResizeToFitDeviceOptions (val) {
    return new ResizeToFitDeviceOptions(val, true);
}

// Commands
export class ClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.click;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class RightClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.rightClick;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class DoubleClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.doubleClick;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class HoverCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.hover;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class TypeTextCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.typeText;
        this.selector = null;
        this.text     = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'text', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initTypeOptions, required: true }
        ];
    }
}

export class DragCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type        = TYPE.drag;
        this.selector    = null;
        this.dragOffsetX = null;
        this.dragOffsetY = null;
        this.options     = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'dragOffsetX', type: integerArgument, required: true },
            { name: 'dragOffsetY', type: integerArgument, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class DragToElementCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.dragToElement;

        this.selector            = null;
        this.destinationSelector = null;
        this.options             = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'destinationSelector', type: dragDestinationSelector, init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class SelectTextCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.selectText;
        this.selector = null;
        this.startPos = null;
        this.endPos   = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'startPos', type: positiveIntegerArgument },
            { name: 'endPos', type: positiveIntegerArgument }
        ];
    }
}

export class SelectEditableContentCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type          = TYPE.selectEditableContent;
        this.startSelector = null;
        this.endSelector   = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'startSelector', type: selectActionSelector, init: initSelector, required: true },
            { name: 'endSelector', type: selectActionSelector, init: initSelector }
        ];
    }
}

export class SelectTextAreaContentCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type      = TYPE.selectTextAreaContent;
        this.selector  = null;
        this.startLine = null;
        this.startPos  = null;
        this.endLine   = null;
        this.endPos    = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'startLine', type: positiveIntegerArgument },
            { name: 'startPos', type: positiveIntegerArgument },
            { name: 'endLine', type: positiveIntegerArgument },
            { name: 'endPos', type: positiveIntegerArgument }
        ];
    }
}

export class PressKeyCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.pressKey;
        this.keys = '';

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'keys', type: nonEmptyStringArgument, required: true }
        ];
    }
}

export class WaitCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type    = TYPE.wait;
        this.timeout = null;
        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'timeout', type: positiveIntegerArgument, required: true }
        ];
    }
}

export class NavigateToCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.navigateTo;
        this.url  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'url', type: navigateToUrlArgument, required: true }
        ];
    }
}

export class UploadFileCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.uploadFile;

        this.selector = null;
        this.filePath = '';

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true },
            { name: 'filePath', type: stringOrStringArrayArgument, required: true }
        ];
    }
}

export class ClearUploadCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.clearUpload;

        this.selector = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', type: selector, init: initSelector, required: true }
        ];
    }
}

class ExecuteClientFunctionCommandBase extends Assignable {
    constructor (type, obj) {
        super();

        this.type = type;

        this.instantiationCallsiteName = '';
        this.fnCode                    = '';
        this.args                      = [];

        this._assignFrom(obj, false);
    }

    _getAssignableProperties () {
        return [
            { name: 'instantiationCallsiteName' },
            { name: 'fnCode' },
            { name: 'args' }
        ];
    }
}

export class ExecuteClientFunctionCommand extends ExecuteClientFunctionCommandBase {
    constructor (obj) {
        super(TYPE.executeClientFunction, obj);
    }
}

export class ExecuteSelectorCommand extends ExecuteClientFunctionCommandBase {
    constructor (obj) {
        super(TYPE.executeSelector);

        this.visibilityCheck = false;
        this.timeout         = null;

        this._assignFrom(obj, false);
    }

    _getAssignableProperties () {
        return super._getAssignableProperties().concat([
            { name: 'visibilityCheck' },
            { name: 'timeout' }
        ]);
    }
}

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

export class PrepareBrowserManipulationCommand {
    constructor () {
        this.type = TYPE.prepareBrowserManipulation;
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

export class TestDoneCommand {
    constructor () {
        this.type = TYPE.testDone;
    }
}

// Factory
export function createCommandFromObject (obj) {
    /* eslint-disable indent*/
    // TODO: eslint raises an 'incorrect indent' error here. We use
    // an old eslint version (v1.x.x). We should migrate to v2.x.x
    switch (obj.type) {
        case TYPE.click:
            return new ClickCommand(obj);

        case TYPE.rightClick:
            return new RightClickCommand(obj);

        case TYPE.doubleClick:
            return new DoubleClickCommand(obj);

        case TYPE.hover:
            return new HoverCommand(obj);

        case TYPE.drag:
            return new DragCommand(obj);

        case TYPE.dragToElement:
            return new DragToElementCommand(obj);

        case TYPE.typeText:
            return new TypeTextCommand(obj);

        case TYPE.selectText:
            return new SelectTextCommand(obj);

        case TYPE.selectTextAreaContent:
            return new SelectTextAreaContentCommand(obj);

        case TYPE.selectEditableContent:
            return new SelectEditableContentCommand(obj);

        case TYPE.pressKey:
            return new PressKeyCommand(obj);

        case TYPE.wait:
            return new WaitCommand(obj);

        case TYPE.navigateTo:
            return new NavigateToCommand(obj);

        case TYPE.uploadFile:
            return new UploadFileCommand(obj);

        case TYPE.clearUpload:
            return new ClearUploadCommand(obj);

        case TYPE.takeScreenshot:
            return new TakeScreenshotCommand(obj);

        case TYPE.resizeWindow:
            return new ResizeWindowCommand(obj);

        case TYPE.resizeWindowToFitDevice:
            return new ResizeWindowToFitDeviceCommand(obj);

        case TYPE.testDone:
            return new TestDoneCommand();
    }
    /* eslint-enable indent*/
}

export function isCommandRejectableByPageError (command) {
    return !isObservationCommand(command) && !isWindowManipulationCommand(command) && !isServiceCommand(command);
}

function isObservationCommand (command) {
    return command.type === TYPE.executeClientFunction ||
           command.type === TYPE.executeSelector ||
           command.type === TYPE.wait;
}

export function isWindowManipulationCommand (command) {
    return command.type === TYPE.takeScreenshot ||
           command.type === TYPE.takeScreenshotOnFail ||
           command.type === TYPE.resizeWindow ||
           command.type === TYPE.resizeWindowToFitDevice;
}

export function isServiceCommand (command) {
    return command.type === TYPE.testDone ||
           command.type === TYPE.takeScreenshotOnFail ||
           command.type === TYPE.prepareBrowserManipulation;
}

