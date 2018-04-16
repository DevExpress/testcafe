import TYPE from './type';
import SelectorBuilder from '../../client-functions/selectors/selector-builder';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import functionBuilderSymbol from '../../client-functions/builder-symbol';
import Assignable from '../../utils/assignable';
import { ActionOptions, ClickOptions, MouseOptions, TypeOptions, DragToElementOptions } from './options';
import { initSelector } from './validations/initializers';

import {
    actionOptions,
    integerArgument,
    positiveIntegerArgument,
    nonEmptyStringArgument,
    nullableStringArgument,
    urlArgument,
    stringOrStringArrayArgument,
    setSpeedArgument,
    actionRoleArgument
} from './validations/argument';

import { SetNativeDialogHandlerCodeWrongTypeError } from '../../errors/test-run';
import { ExecuteClientFunctionCommand } from './observation';


// Initializers
function initActionOptions (name, val) {
    return new ActionOptions(val, true);
}

function initClickOptions (name, val) {
    return new ClickOptions(val, true);
}

function initMouseOptions (name, val) {
    return new MouseOptions(val, true);
}

function initTypeOptions (name, val) {
    return new TypeOptions(val, true);
}

function initDragToElementOptions (name, val) {
    return new DragToElementOptions(val, true);
}

function initDialogHandler (name, val) {
    var fn = val.fn;

    if (fn === null || fn instanceof ExecuteClientFunctionCommand)
        return fn;

    var options      = val.options;
    var methodName   = 'setNativeDialogHandler';
    var builder      = fn && fn[functionBuilderSymbol];
    var isSelector   = builder instanceof SelectorBuilder;
    var functionType = typeof fn;

    if (functionType !== 'function' || isSelector)
        throw new SetNativeDialogHandlerCodeWrongTypeError(isSelector ? 'Selector' : functionType);

    builder = builder instanceof ClientFunctionBuilder ?
        fn.with(options)[functionBuilderSymbol] :
        new ClientFunctionBuilder(fn, options, { instantiation: methodName, execution: methodName });

    return builder.getCommand([]);

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
            { name: 'selector', init: initSelector, required: true },
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
            { name: 'selector', init: initSelector, required: true },
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
            { name: 'selector', init: initSelector, required: true },
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
            { name: 'selector', init: initSelector, required: true },
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
            { name: 'selector', init: initSelector, required: true },
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
            { name: 'selector', init: initSelector, required: true },
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
            { name: 'selector', init: initSelector, required: true },
            { name: 'destinationSelector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initDragToElementOptions, required: true }
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
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'startPos', type: positiveIntegerArgument },
            { name: 'endPos', type: positiveIntegerArgument },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true }
        ];
    }
}

export class SelectEditableContentCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type          = TYPE.selectEditableContent;
        this.startSelector = null;
        this.endSelector   = null;
        this.options       = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'startSelector', init: initSelector, required: true },
            { name: 'endSelector', init: initSelector },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true }
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
        this.options   = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'startLine', type: positiveIntegerArgument },
            { name: 'startPos', type: positiveIntegerArgument },
            { name: 'endLine', type: positiveIntegerArgument },
            { name: 'endPos', type: positiveIntegerArgument },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true }
        ];
    }
}

export class PressKeyCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type    = TYPE.pressKey;
        this.keys    = '';
        this.options = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'keys', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true }
        ];
    }
}

export class NavigateToCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type          = TYPE.navigateTo;
        this.url           = null;
        this.stateSnapshot = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'url', type: urlArgument, required: true },
            { name: 'stateSnapshot', type: nullableStringArgument }
        ];
    }
}

export class SetFilesToUploadCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.setFilesToUpload;

        this.selector = null;
        this.filePath = '';

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: (name, val) => initSelector(name, val, true), required: true },
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
            { name: 'selector', init: (name, val) => initSelector(name, val, true), required: true }
        ];
    }
}

export class SwitchToIframeCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.switchToIframe;
        this.selector = null;
        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true }
        ];
    }
}

export class SwitchToMainWindowCommand {
    constructor () {
        this.type = TYPE.switchToMainWindow;
    }
}

export class SetNativeDialogHandlerCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type          = TYPE.setNativeDialogHandler;
        this.dialogHandler = {};

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'dialogHandler', init: initDialogHandler, required: true }
        ];
    }
}

export class GetNativeDialogHistoryCommand {
    constructor () {
        this.type = TYPE.getNativeDialogHistory;
    }
}

export class GetBrowserConsoleMessagesCommand {
    constructor () {
        this.type = TYPE.getBrowserConsoleMessages;
    }
}

export class SetTestSpeedCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type  = TYPE.setTestSpeed;
        this.speed = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'speed', type: setSpeedArgument, required: true }
        ];
    }
}

export class SetPageLoadTimeoutCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.setPageLoadTimeout;
        this.duration = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'duration', type: positiveIntegerArgument, required: true }
        ];
    }
}

export class UseRoleCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.useRole;
        this.role = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'role', type: actionRoleArgument, required: true }
        ];
    }
}
