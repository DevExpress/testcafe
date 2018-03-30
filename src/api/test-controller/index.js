import Promise from 'pinkie';
import { identity, assign, isNil as isNullOrUndefined, flattenDeep as flatten } from 'lodash';
import { getCallsiteForMethod } from '../../errors/get-callsite';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import Assertion from './assertion';
import { getDelegatedAPIList, delegateAPI } from '../../utils/delegated-api';

import {
    ClickCommand,
    RightClickCommand,
    DoubleClickCommand,
    HoverCommand,
    DragCommand,
    DragToElementCommand,
    TypeTextCommand,
    SelectTextCommand,
    SelectTextAreaContentCommand,
    SelectEditableContentCommand,
    PressKeyCommand,
    NavigateToCommand,
    SetFilesToUploadCommand,
    ClearUploadCommand,
    SwitchToIframeCommand,
    SwitchToMainWindowCommand,
    SetNativeDialogHandlerCommand,
    GetNativeDialogHistoryCommand,
    GetBrowserConsoleMessagesCommand,
    SetTestSpeedCommand,
    SetPageLoadTimeoutCommand,
    UseRoleCommand
} from '../../test-run/commands/actions';

import {
    TakeScreenshotCommand,
    TakeElementScreenshotCommand,
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand,
    MaximizeWindowCommand
} from '../../test-run/commands/browser-manipulation';

import { WaitCommand, DebugCommand } from '../../test-run/commands/observation';
import assertRequestHookType from '../request-hooks/assert-type';

export default class TestController {
    constructor (testRun) {
        this.testRun               = testRun;
        this.executionChain        = Promise.resolve();
        this.callsitesWithoutAwait = new Set();
    }

    // NOTE: we track missing `awaits` by exposing a special custom Promise to user code.
    // Action or assertion is awaited if:
    // a)someone used `await` so Promise's `then` function executed
    // b)Promise chained by using one of the mixed-in controller methods
    //
    // In both scenarios, we check that callsite that produced Promise is equal to the one
    // that is currently missing await. This is required to workaround scenarios like this:
    //
    // var t2 = t.click('#btn1'); // <-- stores new callsiteWithoutAwait
    // await t2;                  // <-- callsiteWithoutAwait = null
    // t.click('#btn2');          // <-- stores new callsiteWithoutAwait
    // await t2.click('#btn3');   // <-- without check it will set callsiteWithoutAwait = null, so we will lost tracking
    _createExtendedPromise (promise, callsite) {
        var extendedPromise     = promise.then(identity);
        var originalThen        = extendedPromise.then;
        var markCallsiteAwaited = () => this.callsitesWithoutAwait.delete(callsite);


        extendedPromise.then = function () {
            markCallsiteAwaited();
            return originalThen.apply(this, arguments);
        };

        delegateAPI(extendedPromise, TestController.API_LIST, {
            handler:     this,
            proxyMethod: markCallsiteAwaited
        });

        return extendedPromise;
    }

    _enqueueTask (apiMethodName, createTaskExecutor) {
        var callsite = getCallsiteForMethod(apiMethodName);
        var executor = createTaskExecutor(callsite);

        this.executionChain = this.executionChain.then(executor);

        this.callsitesWithoutAwait.add(callsite);

        return this._createExtendedPromise(this.executionChain, callsite);
    }

    _enqueueCommand (apiMethodName, CmdCtor, cmdArgs) {
        return this._enqueueTask(apiMethodName, callsite => {
            var command = null;

            try {
                command = new CmdCtor(cmdArgs);
            }
            catch (err) {
                err.callsite = callsite;
                throw err;
            }

            return () => this.testRun.executeCommand(command, callsite);
        });
    }

    // API implementation
    // We need implementation methods to obtain correct callsites. If we use plain API
    // methods in chained wrappers then we will have callsite for the wrapped method
    // in this file instead of chained method callsite in user code.
    _ctx$getter () {
        return this.testRun.ctx;
    }

    _ctx$setter (val) {
        this.testRun.ctx = val;

        return this.testRun.ctx;
    }

    _fixtureCtx$getter () {
        return this.testRun.fixtureCtx;
    }

    _click$ (selector, options) {
        return this._enqueueCommand('click', ClickCommand, { selector, options });
    }

    _rightClick$ (selector, options) {
        return this._enqueueCommand('rightClick', RightClickCommand, { selector, options });
    }

    _doubleClick$ (selector, options) {
        return this._enqueueCommand('doubleClick', DoubleClickCommand, { selector, options });
    }

    _hover$ (selector, options) {
        return this._enqueueCommand('hover', HoverCommand, { selector, options });
    }

    _drag$ (selector, dragOffsetX, dragOffsetY, options) {
        return this._enqueueCommand('drag', DragCommand, { selector, dragOffsetX, dragOffsetY, options });
    }

    _dragToElement$ (selector, destinationSelector, options) {
        return this._enqueueCommand('dragToElement', DragToElementCommand, { selector, destinationSelector, options });
    }

    _typeText$ (selector, text, options) {
        return this._enqueueCommand('typeText', TypeTextCommand, { selector, text, options });
    }

    _selectText$ (selector, startPos, endPos, options) {
        return this._enqueueCommand('selectText', SelectTextCommand, { selector, startPos, endPos, options });
    }

    _selectTextAreaContent$ (selector, startLine, startPos, endLine, endPos, options) {
        return this._enqueueCommand('selectTextAreaContent', SelectTextAreaContentCommand, {
            selector,
            startLine,
            startPos,
            endLine,
            endPos,
            options
        });
    }

    _selectEditableContent$ (startSelector, endSelector, options) {
        return this._enqueueCommand('selectEditableContent', SelectEditableContentCommand, {
            startSelector,
            endSelector,
            options
        });
    }

    _pressKey$ (keys, options) {
        return this._enqueueCommand('pressKey', PressKeyCommand, { keys, options });
    }

    _wait$ (timeout) {
        return this._enqueueCommand('wait', WaitCommand, { timeout });
    }

    _navigateTo$ (url) {
        return this._enqueueCommand('navigateTo', NavigateToCommand, { url });
    }

    _setFilesToUpload$ (selector, filePath) {
        return this._enqueueCommand('setFilesToUpload', SetFilesToUploadCommand, { selector, filePath });
    }

    _clearUpload$ (selector) {
        return this._enqueueCommand('clearUpload', ClearUploadCommand, { selector });
    }

    _takeScreenshot$ (path) {
        return this._enqueueCommand('takeScreenshot', TakeScreenshotCommand, { path });
    }

    _takeElementScreenshot$ (selector, ...args) {
        var commandArgs = { selector };

        if (args[1]) {
            commandArgs.path    = args[0];
            commandArgs.options = args[1];
        }
        else if (typeof args[0] === 'object')
            commandArgs.options = args[0];
        else
            commandArgs.path = args[0];

        return this._enqueueCommand('takeElementScreenshot', TakeElementScreenshotCommand, commandArgs);
    }

    _resizeWindow$ (width, height) {
        return this._enqueueCommand('resizeWindow', ResizeWindowCommand, { width, height });
    }

    _resizeWindowToFitDevice$ (device, options) {
        return this._enqueueCommand('resizeWindowToFitDevice', ResizeWindowToFitDeviceCommand, { device, options });
    }

    _maximizeWindow$ () {
        return this._enqueueCommand('maximizeWindow', MaximizeWindowCommand);
    }

    _switchToIframe$ (selector) {
        return this._enqueueCommand('switchToIframe', SwitchToIframeCommand, { selector });
    }

    _switchToMainWindow$ () {
        return this._enqueueCommand('switchToMainWindow', SwitchToMainWindowCommand);
    }

    _eval$ (fn, options) {
        if (!isNullOrUndefined(options))
            options = assign({}, options, { boundTestRun: this });

        var builder  = new ClientFunctionBuilder(fn, options, { instantiation: 'eval', execution: 'eval' });
        var clientFn = builder.getFunction();

        return clientFn();
    }

    _setNativeDialogHandler$ (fn, options) {
        return this._enqueueCommand('setNativeDialogHandler', SetNativeDialogHandlerCommand, {
            dialogHandler: { fn, options }
        });
    }

    _getNativeDialogHistory$ () {
        var callsite = getCallsiteForMethod('getNativeDialogHistory');

        return this.testRun.executeCommand(new GetNativeDialogHistoryCommand(), callsite);
    }

    _getBrowserConsoleMessages$ () {
        var callsite = getCallsiteForMethod('getBrowserConsoleMessages');

        return this.testRun.executeCommand(new GetBrowserConsoleMessagesCommand(), callsite);
    }

    _expect$ (actual) {
        return new Assertion(actual, this);
    }

    _debug$ () {
        return this._enqueueCommand('debug', DebugCommand);
    }

    _setTestSpeed$ (speed) {
        return this._enqueueCommand('setTestSpeed', SetTestSpeedCommand, { speed });
    }

    _setPageLoadTimeout$ (duration) {
        return this._enqueueCommand('setPageLoadTimeout', SetPageLoadTimeoutCommand, { duration });
    }

    _useRole$ (role) {
        return this._enqueueCommand('useRole', UseRoleCommand, { role });
    }

    _addRequestHooks$ (...hooks) {
        return this._enqueueTask('addRequestHooks', () => {
            hooks = flatten(hooks);

            assertRequestHookType(hooks);

            hooks.forEach(hook => this.testRun.addRequestHook(hook));
        });
    }

    _removeRequestHooks$ (...hooks) {
        return this._enqueueTask('removeRequestHooks', () => {
            hooks = flatten(hooks);

            assertRequestHookType(hooks);

            hooks.forEach(hook => this.testRun.removeRequestHook(hook));
        });
    }
}

TestController.API_LIST = getDelegatedAPIList(TestController.prototype);

delegateAPI(TestController.prototype, TestController.API_LIST, { useCurrentCtxAsHandler: true });
