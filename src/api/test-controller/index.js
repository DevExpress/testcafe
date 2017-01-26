import Promise from 'pinkie';
import { identity, assign, isNil as isNullOrUndefined } from 'lodash';
import { MissingAwaitError } from '../../errors/test-run';
import getCallsite from '../../errors/get-callsite';
import showDeprecationMessage from '../../notifications/deprecation-message';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import SelectorBuilder from '../../client-functions/selector-builder';
import Assertion from '../assertion';
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
    GetNativeDialogHistoryCommand
} from '../../test-run/commands/actions';

import {
    TakeScreenshotCommand,
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand,
    MaximizeWindowCommand
} from '../../test-run/commands/browser-manipulation';

import { WaitCommand, DebugCommand } from '../../test-run/commands/observation';

export default class TestController {
    constructor (testRun) {
        this.testRun              = testRun;
        this.executionChain       = Promise.resolve();
        this.callsiteWithoutAwait = null;
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
        var extendedPromise = promise.then(identity);
        var originalThen    = extendedPromise.then;

        var ensureAwait = () => {
            if (this.callsiteWithoutAwait === callsite)
                this.callsiteWithoutAwait = null;
        };

        extendedPromise.then = function () {
            ensureAwait();
            return originalThen.apply(this, arguments);
        };

        delegateAPI(extendedPromise, TestController.API_LIST, {
            handler:     this,
            proxyMethod: ensureAwait
        });

        return extendedPromise;
    }

    _enqueueTask (apiMethodName, createTaskExecutor) {
        this._checkForMissingAwait();

        var callsite = getCallsite(apiMethodName);
        var executor = createTaskExecutor(callsite);

        this.executionChain       = this.executionChain.then(executor);
        this.callsiteWithoutAwait = callsite;

        return this._createExtendedPromise(this.executionChain, callsite);
    }

    _enqueueAction (apiMethodName, CmdCtor, cmdArgs) {
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

    _checkForMissingAwait () {
        if (this.callsiteWithoutAwait)
            throw new MissingAwaitError(this.callsiteWithoutAwait);
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

    _click$ (selector, options) {
        return this._enqueueAction('click', ClickCommand, { selector, options });
    }

    _rightClick$ (selector, options) {
        return this._enqueueAction('rightClick', RightClickCommand, { selector, options });
    }

    _doubleClick$ (selector, options) {
        return this._enqueueAction('doubleClick', DoubleClickCommand, { selector, options });
    }

    _hover$ (selector, options) {
        return this._enqueueAction('hover', HoverCommand, { selector, options });
    }

    _drag$ (selector, dragOffsetX, dragOffsetY, options) {
        return this._enqueueAction('drag', DragCommand, { selector, dragOffsetX, dragOffsetY, options });
    }

    _dragToElement$ (selector, destinationSelector, options) {
        return this._enqueueAction('dragToElement', DragToElementCommand, { selector, destinationSelector, options });
    }

    _typeText$ (selector, text, options) {
        return this._enqueueAction('typeText', TypeTextCommand, { selector, text, options });
    }

    _selectText$ (selector, startPos, endPos) {
        return this._enqueueAction('selectText', SelectTextCommand, { selector, startPos, endPos });
    }

    _selectTextAreaContent$ (selector, startLine, startPos, endLine, endPos) {
        return this._enqueueAction('selectTextAreaContent', SelectTextAreaContentCommand, {
            selector,
            startLine,
            startPos,
            endLine,
            endPos
        });
    }

    _selectEditableContent$ (startSelector, endSelector) {
        return this._enqueueAction('selectEditableContent', SelectEditableContentCommand, {
            startSelector,
            endSelector
        });
    }

    _pressKey$ (keys) {
        return this._enqueueAction('pressKey', PressKeyCommand, { keys });
    }

    _wait$ (timeout) {
        return this._enqueueAction('wait', WaitCommand, { timeout });
    }

    _navigateTo$ (url) {
        return this._enqueueAction('navigateTo', NavigateToCommand, { url });
    }

    _setFilesToUpload$ (selector, filePath) {
        return this._enqueueAction('setFilesToUpload', SetFilesToUploadCommand, { selector, filePath });
    }

    _clearUpload$ (selector) {
        return this._enqueueAction('clearUpload', ClearUploadCommand, { selector });
    }

    _takeScreenshot$ (path) {
        return this._enqueueAction('takeScreenshot', TakeScreenshotCommand, { path });
    }

    _resizeWindow$ (width, height) {
        return this._enqueueAction('resizeWindow', ResizeWindowCommand, { width, height });
    }

    _resizeWindowToFitDevice$ (device, options) {
        return this._enqueueAction('resizeWindowToFitDevice', ResizeWindowToFitDeviceCommand, { device, options });
    }

    _maximizeWindow$ () {
        return this._enqueueAction('maximizeWindow', MaximizeWindowCommand);
    }

    _switchToIframe$ (selector) {
        return this._enqueueAction('switchToIframe', SwitchToIframeCommand, { selector });
    }

    _switchToMainWindow$ () {
        return this._enqueueAction('switchToMainWindow', SwitchToMainWindowCommand);
    }

    _eval$ (fn, options) {
        if (!isNullOrUndefined(options))
            options = assign({}, options, { boundTestRun: this });

        var builder  = new ClientFunctionBuilder(fn, options, { instantiation: 'eval', execution: 'eval' });
        var clientFn = builder.getFunction();

        return clientFn();
    }

    _select$ (fn, options) {
        showDeprecationMessage(getCallsite('select'), {
            what:       't.select',
            useInstead: 'Selector'
        });

        if (!isNullOrUndefined(options))
            options = assign({}, options, { boundTestRun: this });

        var builder  = new SelectorBuilder(fn, options, { instantiation: 'select', execution: 'select' });
        var selector = builder.getFunction();

        return selector();
    }

    _setNativeDialogHandler$ (dialogHandler, options) {
        return this._enqueueAction('setNativeDialogHandler', SetNativeDialogHandlerCommand, {
            dialogHandler: {
                dialogHandler,
                options
            }
        });
    }

    _getNativeDialogHistory$ () {
        var callsite = getCallsite('getNativeDialogHistory');

        return this.testRun.executeCommand(new GetNativeDialogHistoryCommand(), callsite);
    }

    _expect$ (actual) {
        return new Assertion(actual, this);
    }

    _debug$ () {
        return this._enqueueAction('debug', DebugCommand);
    }
}

TestController.API_LIST = getDelegatedAPIList(TestController.prototype);

delegateAPI(TestController.prototype, TestController.API_LIST, { useCurrentCtxAsHandler: true });
