import TYPE from './type';
import SelectorBuilder from '../../client-functions/selectors/selector-builder';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import functionBuilderSymbol from '../../client-functions/builder-symbol';
import { ActionCommandBase, CommandBase } from './base';
import {
    ActionOptions,
    ClickOptions,
    MouseOptions,
    TypeOptions,
    PressOptions,
    DragToElementOptions,
    OffsetOptions,
    CookieOptions,
    GetProxyUrlOptions,
    RequestOptions,
    SkipJsErrorsOptions,
    SkipJsErrorsCallbackWithOptions,
} from './options';

import {
    initSelector,
    initTypeSelector,
    initUploadSelector,
} from './validations/initializers';
import { executeJsExpression } from '../execute-js-expression';
import { isJSExpression } from './utils';

import {
    actionOptions,
    integerArgument,
    positiveIntegerArgument,
    stringArgument,
    nonEmptyStringArgument,
    nullableStringArgument,
    pageUrlArgument,
    stringOrStringArrayArgument,
    setSpeedArgument,
    actionRoleArgument,
    booleanArgument,
    functionArgument,
    cookiesArgument,
    setCookiesArgument,
    urlsArgument,
    urlArgument,
    skipJsErrorOptions,
    requestHooksArgument,
} from './validations/argument';

import { SetNativeDialogHandlerCodeWrongTypeError } from '../../errors/test-run';
import { ExecuteClientFunctionCommand } from './execute-client-function';
import { camelCase } from 'lodash';
import {
    prepareSkipJsErrorsOptions,
    isSkipJsErrorsOptionsObject,
    isSkipJsErrorsCallbackWithOptionsObject,
} from '../../api/skip-js-errors';


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

    return builder.getCommand();
}

function initCookiesOption (name, val, initOptions, validate = true) {
    return val.map(cookie => new CookieOptions(cookie, validate));
}

function initRequestOption (name, val, initOptions, validate = true) {
    return new RequestOptions(val, validate);
}

function initGetProxyUrlOptions (name, val, initOptions, validate = true) {
    return new GetProxyUrlOptions(val, validate);
}

function initSkipJsErrorsOptions (name, val, initOptions, validate = true) {
    if (val === void 0)
        return true;

    if (isSkipJsErrorsCallbackWithOptionsObject(val))
        val = new SkipJsErrorsCallbackWithOptions(val, validate);

    else if (isSkipJsErrorsOptionsObject(val))
        val = new SkipJsErrorsOptions(val, validate);

    return prepareSkipJsErrorsOptions(val);
}

// Commands
export class DispatchEventCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.dispatchEvent);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.dispatchEvent, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'eventName', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions },
            { name: 'relatedTarget', init: initSelector, required: false },
        ];
    }
}

export class ClickCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.click);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.click, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true },
        ];
    }
}

export class RightClickCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.rightClick);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.rightClick, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true },
        ];
    }
}

export class ExecuteExpressionCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.executeExpression, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'expression', type: nonEmptyStringArgument, required: true },
            { name: 'resultVariableName', type: nonEmptyStringArgument, defaultValue: null },
        ];
    }
}

export class ExecuteAsyncExpressionCommand extends CommandBase {
    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.executeAsyncExpression, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'expression', type: stringArgument, required: true },
        ];
    }
}

export class DoubleClickCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.doubleClick);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.doubleClick, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true },
        ];
    }
}

export class HoverCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.hover);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.hover, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true },
        ];
    }
}

export class TypeTextCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.typeText);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.typeText, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initTypeSelector, required: true },
            { name: 'text', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initTypeOptions, required: true },
        ];
    }
}

export class DragCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.drag);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.drag, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'dragOffsetX', type: integerArgument, required: true },
            { name: 'dragOffsetY', type: integerArgument, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true },
        ];
    }
}

export class DragToElementCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.dragToElement);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.dragToElement, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'destinationSelector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initDragToElementOptions, required: true },
        ];
    }
}

export class ScrollCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.scroll);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.scroll, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: false },
            { name: 'position', type: nullableStringArgument, required: false },
            { name: 'x', type: positiveIntegerArgument, defaultValue: null },
            { name: 'y', type: positiveIntegerArgument, defaultValue: null },
            { name: 'options', type: actionOptions, init: initOffsetOptions, required: true },
        ];
    }
}

export class ScrollByCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.scrollBy);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.scrollBy, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: false },
            { name: 'byX', type: integerArgument, defaultValue: 0 },
            { name: 'byY', type: integerArgument, defaultValue: 0 },
            { name: 'options', type: actionOptions, init: initOffsetOptions, required: true },
        ];
    }
}

export class ScrollIntoViewCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.scrollIntoView);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.scrollIntoView, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initOffsetOptions, required: true },
        ];
    }
}

export class SelectTextCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.selectText);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.selectText, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'startPos', type: positiveIntegerArgument, defaultValue: null },
            { name: 'endPos', type: positiveIntegerArgument, defaultValue: null },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true },
        ];
    }
}

export class SelectEditableContentCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.selectEditableContent);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.selectEditableContent, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'startSelector', init: initSelector, required: true },
            { name: 'endSelector', init: initSelector, defaultValue: null },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true },
        ];
    }
}

export class SelectTextAreaContentCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.selectTextAreaContent);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.selectTextAreaContent, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'startLine', type: positiveIntegerArgument, defaultValue: null },
            { name: 'startPos', type: positiveIntegerArgument, defaultValue: null },
            { name: 'endLine', type: positiveIntegerArgument, defaultValue: null },
            { name: 'endPos', type: positiveIntegerArgument, defaultValue: null },
            { name: 'options', type: actionOptions, init: initActionOptions, required: true },
        ];
    }
}

export class PressKeyCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.pressKey);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.pressKey, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'keys', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initPressOptions, required: true },
        ];
    }
}

export class NavigateToCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.navigateTo);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.navigateTo, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'url', type: pageUrlArgument, required: true },
            { name: 'stateSnapshot', type: nullableStringArgument, defaultValue: null },
            { name: 'forceReload', type: booleanArgument, defaultValue: false },
        ];
    }
}

export class SetFilesToUploadCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.setFilesToUpload);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setFilesToUpload, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initUploadSelector, required: true },
            { name: 'filePath', type: stringOrStringArrayArgument, required: true },
        ];
    }
}

export class ClearUploadCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.clearUpload);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.clearUpload, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initUploadSelector, required: true },
        ];
    }
}

export class SwitchToIframeCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.switchToIframe);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToIframe, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
        ];
    }
}

export class SwitchToMainWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.switchToMainWindow);

    constructor () {
        super();
        this.type = TYPE.switchToMainWindow;
    }
}

export class OpenWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.openWindow);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.openWindow, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'url', type: pageUrlArgument },
        ];
    }
}

export class CloseWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.closeWindow);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.closeWindow, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'windowId', type: nullableStringArgument, required: true },
        ];
    }
}


export class GetCurrentWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.getCurrentWindow);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.getCurrentWindow, validateProperties);
    }
}

export class GetCurrentWindowsCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.getCurrentWindows);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.getCurrentWindows, validateProperties);
    }
}

export class GetCurrentCDPSessionCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.getCurrentCDPSession);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.getCurrentCDPSession, validateProperties);
    }
}

export class SwitchToWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.switchToWindow);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToWindow, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'windowId', type: nonEmptyStringArgument, required: true },
        ];
    }
}

export class SwitchToWindowByPredicateCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.switchToWindow);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToWindowByPredicate, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'id', type: nonEmptyStringArgument, required: false },
            { name: 'checkWindow', type: functionArgument, required: true },
        ];
    }
}

export class SwitchToParentWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.switchToParentWindow);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToParentWindow, validateProperties);
    }
}

export class SwitchToPreviousWindowCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.switchToPreviousWindow);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.switchToPreviousWindow, validateProperties);
    }
}

export class SetNativeDialogHandlerCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.setNativeDialogHandler);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setNativeDialogHandler, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'dialogHandler', init: initDialogHandler, required: true },
        ];
    }

    static from (val) {
        const dialogHandlerStub = {
            dialogHandler: { fn: null },
        };

        const command = new SetNativeDialogHandlerCommand(dialogHandlerStub);

        command.dialogHandler = val.dialogHandler;

        return command;
    }
}

export class GetNativeDialogHistoryCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.getNativeDialogHistory);

    constructor () {
        super();
        this.type = TYPE.getNativeDialogHistory;
    }
}

export class GetBrowserConsoleMessagesCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.getBrowserConsoleMessages);

    constructor () {
        super();
        this.type = TYPE.getBrowserConsoleMessages;
    }
}

export class SetTestSpeedCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.setTestSpeed);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setTestSpeed, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'speed', type: setSpeedArgument, required: true },
        ];
    }
}

export class SetPageLoadTimeoutCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.setPageLoadTimeout);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setPageLoadTimeout, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'duration', type: positiveIntegerArgument, required: true },
        ];
    }
}

export class UseRoleCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.useRole);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.useRole, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'role', type: actionRoleArgument, required: true },
        ];
    }
}

export class CloseChildWindowOnFileDownloading extends ActionCommandBase {
    static methodName = camelCase(TYPE.closeChildWindowOnFileDownloading);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.closeChildWindowOnFileDownloading, validateProperties);
    }
}

export class RecorderCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.recorder);

    constructor (obj, testRun) {
        super(obj, testRun, TYPE.recorder);
    }

    getAssignableProperties () {
        return [
            { name: 'subtype', type: nonEmptyStringArgument, required: true },
            { name: 'forceExecutionInTopWindowOnly', type: booleanArgument, defaultValue: false },
        ];
    }
}

export class GetCookiesCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.getCookies);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.getCookies, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'urls', type: urlsArgument, required: false },
            { name: 'cookies', type: cookiesArgument, init: initCookiesOption, required: false },
        ];
    }
}

export class SetCookiesCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.setCookies);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.setCookies, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'url', type: urlsArgument, required: false },
            { name: 'cookies', type: setCookiesArgument, init: initCookiesOption, required: true },
        ];
    }
}

export class DeleteCookiesCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.deleteCookies);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.deleteCookies, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'urls', type: urlsArgument, required: false },
            { name: 'cookies', type: cookiesArgument, init: initCookiesOption, required: false },
        ];
    }
}

export class RequestCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.request);
    static extendedMethods = ['get', 'post', 'delete', 'put', 'patch', 'head'];
    static resultGetters = ['status', 'statusText', 'headers', 'body'];

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.request, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'url', type: urlArgument, required: false },
            { name: 'options', type: actionOptions, init: initRequestOption, required: false },
        ];
    }
}

export class GetProxyUrlCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.getProxyUrl);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.getProxyUrl, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'url', type: urlArgument, required: true },
            { name: 'options', init: initGetProxyUrlOptions, required: false },
        ];
    }
}

export class SkipJsErrorsCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.skipJsErrors);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.skipJsErrors, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'options', type: skipJsErrorOptions, init: initSkipJsErrorsOptions, required: false, defaultValue: true },
        ];
    }
}

export class RunCustomActionCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.runCustomAction);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.runCustomAction, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'fn', type: functionArgument, required: true },
            { name: 'name', type: stringArgument, required: true },
            { name: 'args', required: false },
        ];
    }
}

export class AddRequestHooksCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.addRequestHooks);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.addRequestHooks, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'hooks', type: requestHooksArgument, required: true },
        ];
    }
}

export class RemoveRequestHooksCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.removeRequestHooks);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.removeRequestHooks, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'hooks', type: requestHooksArgument, required: true },
        ];
    }
}

export class ReportCommand extends ActionCommandBase {
    static methodName = camelCase(TYPE.report);

    constructor (obj, testRun, validateProperties) {
        super(obj, testRun, TYPE.report, validateProperties);
    }

    getAssignableProperties () {
        return [
            { name: 'args', required: true },
        ];
    }
}
