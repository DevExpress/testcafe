import TYPE from './type';
import SelectorBuilder from '../../client-functions/selectors/selector-builder';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import functionBuilderSymbol from '../../client-functions/builder-symbol';
import CommandBase from './base';
import { ActionOptions, ClickOptions, MouseOptions, TypeOptions, DragToElementOptions } from './options';
import { initSelector, initUploadSelector } from './validations/initializers';
import executeJsExpression from '../execute-js-expression';
import { isJSExpression } from './utils';

import {
    actionOptions,
    integerArgument,
    positiveIntegerArgument,
    nonEmptyStringArgument,
    nullableStringArgument,
    urlArgument,
    stringOrStringArrayArgument,
    setSpeedArgument,
    actionRoleArgument,
    booleanArgument
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
    let builder      = fn && fn[functionBuilderSymbol];
    const isSelector   = builder instanceof SelectorBuilder;
    const functionType = typeof fn;

    if (functionType !== 'function' || isSelector)
        throw new SetNativeDialogHandlerCodeWrongTypeError(isSelector ? 'Selector' : functionType);

    builder = builder instanceof ClientFunctionBuilder ?
        fn.with(options)[functionBuilderSymbol] :
        new ClientFunctionBuilder(fn, options, { instantiation: methodName, execution: methodName });

    return builder.getCommand([]);

}

// Commands
export class ClickCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.click);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class RightClickCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.rightClick);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class ExecuteExpressionCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.executeExpression);
    }

    _getAssignableProperties () {
        return [
            { name: 'expression', type: nonEmptyStringArgument, required: true },
            { name: 'resultVariableName', type: nonEmptyStringArgument, defaultValue: null },
            { name: 'isAsyncExpression', type: booleanArgument, defaultValue: false }
        ];
    }
}

export class DoubleClickCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.doubleClick);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class HoverCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.hover);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class TypeTextCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.typeText);
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
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.drag);
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
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.dragToElement);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'destinationSelector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initDragToElementOptions, required: true }
        ];
    }
}

export class SelectTextCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.selectText);
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
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.selectEditableContent);
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
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.selectTextAreaContent);
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
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.pressKey);
    }

    _getAssignableProperties () {
        return [
            { name: 'keys', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true }
        ];
    }
}

export class NavigateToCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.navigateTo);
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
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.setFilesToUpload);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initUploadSelector, required: true },
            { name: 'filePath', type: stringOrStringArrayArgument, required: true }
        ];
    }
}

export class ClearUploadCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.clearUpload);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initUploadSelector, required: true }
        ];
    }
}

export class SwitchToIframeCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.switchToIframe);
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

export class SetNativeDialogHandlerCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.setNativeDialogHandler);
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

export class SetTestSpeedCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.setTestSpeed);
    }

    _getAssignableProperties () {
        return [
            { name: 'speed', type: setSpeedArgument, required: true }
        ];
    }
}

export class SetPageLoadTimeoutCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.setPageLoadTimeout);
    }

    _getAssignableProperties () {
        return [
            { name: 'duration', type: positiveIntegerArgument, required: true }
        ];
    }
}

export class UseRoleCommand extends CommandBase {
    constructor (obj, testRun) {
        super(obj, testRun, TYPE.useRole);
    }

    _getAssignableProperties () {
        return [
            { name: 'role', type: actionRoleArgument, required: true }
        ];
    }
}
