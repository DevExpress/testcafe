import TYPE from './type';
import SelectorBuilder from '../../client-functions/selectors/selector-builder';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import functionBuilderSymbol from '../../client-functions/builder-symbol';
import CommandBase from './base';
import {
    ActionOptions,
    ClickOptions,
    MouseOptions,
    TypeOptions,
    PressOptions,
    DragToElementOptions,
    OffsetOptions
} from './options';

import { initSelector, initUploadSelector } from './validations/initializers';
import { executeJsExpression } from '../execute-js-expression';
import { isJSExpression } from './utils';

import {
    actionOptions,
    integerArgument,
    positiveIntegerArgument,
    stringArgument,
    nonEmptyStringArgument,
    nullableStringArgument,
    urlArgument,
    stringOrStringArrayArgument,
    setSpeedArgument,
    actionRoleArgument,
    booleanArgument,
    functionArgument
} from './validations/argument';

import { SetNativeDialogHandlerCodeWrongTypeError } from '../../errors/test-run';
import { ExecuteClientFunctionCommand } from './observation';


// Initializers
function initActionOptions (name, val, initOptions, validate = true) {
    return new ActionOptions(val, validate);
}

function initClickOptions (name, val, initOptions, validate = true) {
    return new ClickOptions(val, validate);
}

function initMouseOptions (name, val, initOptions, validate = true) {
    return new MouseOptions(val, validate);
}

function initOffsetOptions (name, val, initOptions, validate = true) {
    return new OffsetOptions(val, validate);
}

function initTypeOptions (name, val, initOptions, validate = true) {
    return new TypeOptions(val, validate);
}

function initDragToElementOptions (name, val, initOptions, validate = true) {
    return new DragToElementOptions(val, validate);
}

function initPressOptions (name, val, initOptions, validate = true) {
    return new PressOptions(val, validate);
}

function initDialogHandler (name, val, { skipVisibilityCheck, testRun }) {
    let fn;

    if (isJSExpression(val))
        fn = executeJsExpression(val.value, testRun, { skipVisibilityCheck });
    else
        fn = val.fn;

    if (fn === null || fn instanceof ExecuteClientFunctionCommand)
        return fn;

    const options      = val.options;
    const methodName   = 'setNativeDialogHandler';
    const functionType = typeof fn;

    let builder = fn && fn[functionBuilderSymbol];

    const isSelector       = builder instanceof SelectorBuilder;
    const isClientFunction = builder instanceof ClientFunctionBuilder;

    if (functionType !== 'function' || isSelector)
        throw new SetNativeDialogHandlerCodeWrongTypeError(isSelector ? 'Selector' : functionType);

    if (isClientFunction)
        builder = fn.with(options)[functionBuilderSymbol];
    else
        builder = new ClientFunctionBuilder(fn, options, { instantiation: methodName, execution: methodName });

    return builder.getCommand([]);
}

// Commands
export class DispatchEventCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.dispatchEvent, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'eventName', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions },
            { name: 'relatedTarget', init: initSelector, required: false }
        ];
    }
}

export class ClickCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.click, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class RightClickCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.rightClick, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class ExecuteExpressionCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.executeExpression, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'expression', type: nonEmptyStringArgument, required: true },
            { name: 'resultVariableName', type: nonEmptyStringArgument, defaultValue: null }
        ];
    }
}

export class ExecuteAsyncExpressionCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.executeAsyncExpression, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'expression', type: stringArgument, required: true }
        ];
    }
}

export class DoubleClickCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.doubleClick, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class HoverCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.hover, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class TypeTextCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.typeText, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'text', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initTypeOptions, required: true }
        ];
    }
}

export class DragCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.drag, validateProperties);
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

export class DragToElementCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.dragToElement, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'destinationSelector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initDragToElementOptions, required: true }
        ];
    }
}

export class ScrollCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.scroll, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: false },
            { name: 'position', type: nullableStringArgument, required: false },
            { name: 'x', type: positiveIntegerArgument, defaultValue: null },
            { name: 'y', type: positiveIntegerArgument, defaultValue: null },
            { name: 'options', type: actionOptions, init: initOffsetOptions, required: true }
        ];
    }
}

export class ScrollByCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.scrollBy, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: false },
            { name: 'byX', type: integerArgument, defaultValue: 0 },
            { name: 'byY', type: integerArgument, defaultValue: 0 },
            { name: 'options', type: actionOptions, init: initOffsetOptions, required: true }
        ];
    }
}

export class ScrollIntoViewCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.scrollIntoView, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initOffsetOptions, required: true },
        ];
    }
}

export class SelectTextCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.selectText, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'startPos', type: positiveIntegerArgument, defaultValue: null },
            { name: 'endPos', type: positiveIntegerArgument, defaultValue: null },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true }
        ];
    }
}

export class SelectEditableContentCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.selectEditableContent, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'startSelector', init: initSelector, required: true },
            { name: 'endSelector', init: initSelector, defaultValue: null },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true }
        ];
    }
}

export class SelectTextAreaContentCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.selectTextAreaContent, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'startLine', type: positiveIntegerArgument, defaultValue: null },
            { name: 'startPos', type: positiveIntegerArgument, defaultValue: null },
            { name: 'endLine', type: positiveIntegerArgument, defaultValue: null },
            { name: 'endPos', type: positiveIntegerArgument, defaultValue: null },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true }
        ];
    }
}

export class PressKeyCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.pressKey, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'keys', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initPressOptions, required: true }
        ];
    }
}

export class NavigateToCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.navigateTo, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'url', type: urlArgument, required: true },
            { name: 'stateSnapshot', type: nullableStringArgument, defaultValue: null },
            { name: 'forceReload', type: booleanArgument, defaultValue: false }
        ];
    }
}

export class SetFilesToUploadCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setFilesToUpload, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initUploadSelector, required: true },
            { name: 'filePath', type: stringOrStringArrayArgument, required: true }
        ];
    }
}

export class ClearUploadCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.clearUpload, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initUploadSelector, required: true }
        ];
    }
}

export class SwitchToIframeCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToIframe, validateProperties);
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

export class OpenWindowCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.openWindow, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'url', type: urlArgument },
        ];
    }
}

export class CloseWindowCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.closeWindow, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'windowId', type: nullableStringArgument, required: true },
        ];
    }
}


export class GetCurrentWindowCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.getCurrentWindow, validateProperties);
    }

    _getAssignableProperties () {
        return [
        ];
    }
}

export class GetCurrentWindowsCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.getCurrentWindows, validateProperties);
    }

    _getAssignableProperties () {
        return [
        ];
    }
}


export class SwitchToWindowCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToWindow, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'windowId', type: nonEmptyStringArgument, required: true }
        ];
    }
}

export class SwitchToWindowByPredicateCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToWindowByPredicate, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'findWindow', type: functionArgument, required: true }
        ];
    }
}

export class SwitchToParentWindowCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToParentWindow, validateProperties);
    }

    _getAssignableProperties () {
        return [
        ];
    }
}

export class SwitchToPreviousWindowCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToPreviousWindow, validateProperties);
    }

    _getAssignableProperties () {
        return [];
    }
}

export class SetNativeDialogHandlerCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setNativeDialogHandler, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'dialogHandler', init: initDialogHandler, required: true }
        ];
    }

    static from (val) {
        const dialogHandlerStub = {
            dialogHandler: { fn: null }
        };

        const command = new SetNativeDialogHandlerCommand(dialogHandlerStub);

        command.dialogHandler = val.dialogHandler;

        return command;
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

export class SetTestSpeedCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setTestSpeed, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'speed', type: setSpeedArgument, required: true }
        ];
    }
}

export class SetPageLoadTimeoutCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setPageLoadTimeout, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'duration', type: positiveIntegerArgument, required: true }
        ];
    }
}

export class UseRoleCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.useRole, validateProperties);
    }

    _getAssignableProperties () {
        return [
            { name: 'role', type: actionRoleArgument, required: true }
        ];
    }
}

export class RecorderCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.recorder);
    }

    _getAssignableProperties () {
        return [
            { name: 'subtype', type: nonEmptyStringArgument, required: true },
            { name: 'forceExecutionInTopWindowOnly', type: booleanArgument, defaultValue: false }
        ];
    }
}
