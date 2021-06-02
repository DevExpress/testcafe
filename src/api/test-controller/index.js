// TODO: Fix https://github.com/DevExpress/testcafe/issues/4139 to get rid of Pinkie
import Promise from 'pinkie';
import {
    identity,
    assign,
    isNil as isNullOrUndefined,
    flattenDeep as flatten
} from 'lodash';

import { getCallsiteForMethod } from '../../errors/get-callsite';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import Assertion from './assertion';
import { getDelegatedAPIList, delegateAPI } from '../../utils/delegated-api';
import WARNING_MESSAGE from '../../notifications/warning-message';
import getBrowser from '../../utils/get-browser';
import addWarning from '../../notifications/add-rendered-warning';
import { getCallsiteId, getCallsiteStackFrameString } from '../../utils/callsite';
import { getDeprecationMessage, DEPRECATED } from '../../notifications/deprecated';

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
    OpenWindowCommand,
    CloseWindowCommand,
    GetCurrentWindowCommand,
    SwitchToWindowCommand,
    SwitchToWindowByPredicateCommand,
    SwitchToParentWindowCommand,
    SwitchToPreviousWindowCommand,
    SetNativeDialogHandlerCommand,
    GetNativeDialogHistoryCommand,
    GetBrowserConsoleMessagesCommand,
    SetTestSpeedCommand,
    SetPageLoadTimeoutCommand,
    ScrollCommand,
    ScrollByCommand,
    ScrollIntoViewCommand,
    UseRoleCommand,
    DispatchEventCommand
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
import { createExecutionContext as createContext } from './execution-context';
import { isClientFunction, isSelector } from '../../client-functions/types';
import TestRunProxy from '../../services/compiler/test-run-proxy';

import {
    MultipleWindowsModeIsDisabledError,
    MultipleWindowsModeIsNotAvailableInRemoteBrowserError
} from '../../errors/test-run';

const originalThen = Promise.resolve().then;

let inDebug = false;

export default class TestController {
    constructor (testRun) {
        this._executionContext = null;

        this.testRun               = testRun;
        this.executionChain        = Promise.resolve();
        this.warningLog            = testRun.warningLog;
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
        const extendedPromise     = promise.then(identity);
        const observedCallsites   = this.testRun.observedCallsites;
        const markCallsiteAwaited = () => observedCallsites.callsitesWithoutAwait.delete(callsite);

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
        const callsite = getCallsiteForMethod(apiMethodName);
        const executor = createTaskExecutor(callsite);

        this.executionChain.then = originalThen;
        this.executionChain      = this.executionChain.then(executor);

        this.testRun.observedCallsites.callsitesWithoutAwait.add(callsite);

        this.executionChain = this._createExtendedPromise(this.executionChain, callsite);

        return this.executionChain;
    }

    _enqueueCommand (apiMethodName, CmdCtor, cmdArgs) {
        return this._enqueueTask(apiMethodName, callsite => {
            let command = null;

            try {
                command = new CmdCtor(cmdArgs, this.testRun);
            }
            catch (err) {
                err.callsite = callsite;
                throw err;
            }

            return () => {
                return this.testRun.executeAction(apiMethodName, command, callsite)
                    .catch(err => {
                        this.executionChain = Promise.resolve();

                        throw err;
                    });
            };
        });
    }

    _validateMultipleWindowCommand (apiMethodName) {
        const { disableMultipleWindows, browserConnection } = this.testRun;

        if (disableMultipleWindows)
            throw new MultipleWindowsModeIsDisabledError(apiMethodName);

        if (!browserConnection.activeWindowId)
            throw new MultipleWindowsModeIsNotAvailableInRemoteBrowserError(apiMethodName);
    }

    getExecutionContext () {
        if (!this._executionContext)
            this._executionContext = createContext(this.testRun);

        return this._executionContext;
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

    _browser$getter () {
        return getBrowser(this.testRun.browserConnection);
    }

    _dispatchEvent$ (selector, eventName, options = {}) {
        return this._enqueueCommand('dispatchEvent', DispatchEventCommand, { selector, eventName, options, relatedTarget: options.relatedTarget });
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

    _getSelectorForScroll (args) {
        const selector = typeof args[0] === 'string' || isSelector(args[0]) ? args[0] : null;

        if (selector)
            args.shift();
        else
            // NOTE: here we use document.scrollingElement for old Safari versions
            // document.documentElement does not work as expected on Mojave Safari 12.1/ High Sierra Safari 11.1
            // eslint-disable-next-line no-undef
            return () => document.scrollingElement || document.documentElement;

        return selector;
    }

    _getPosition (args) {
        const position = args.length === 1 && typeof args[0] === 'string' ? args[0] : null;

        if (position)
            args.shift();

        return position;
    }

    _scroll$ (...args) {
        let position = this._getPosition(args);

        const selector = this._getSelectorForScroll(args);

        let x       = void 0;
        let y       = void 0;
        let options = void 0;

        if (typeof args[0] === 'string')
            [ position, options ] = args;

        if (typeof args[0] === 'number')
            [ x, y, options ] = args;

        return this._enqueueCommand('scroll', ScrollCommand, { selector, x, y, position, options });
    }

    _scrollBy$ (...args) {
        const selector = this._getSelectorForScroll(args);

        const [byX, byY, options] = args;

        return this._enqueueCommand('scrollBy', ScrollByCommand, { selector, byX, byY, options });
    }

    _scrollIntoView$ (selector, options) {
        return this._enqueueCommand('scrollIntoView', ScrollIntoViewCommand, { selector, options });
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

    _takeScreenshot$ (options) {
        if (options && typeof options !== 'object')
            options = { path: options };

        return this._enqueueCommand('takeScreenshot', TakeScreenshotCommand, options);
    }

    _takeElementScreenshot$ (selector, ...args) {
        const commandArgs = { selector };

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

    _openWindow$ (url) {
        const apiMethodName = 'openWindow';

        this._validateMultipleWindowCommand(apiMethodName);

        return this._enqueueCommand(apiMethodName, OpenWindowCommand, { url });
    }

    _closeWindow$ (window) {
        const apiMethodName = 'closeWindow';
        const windowId      = window?.id || null;

        this._validateMultipleWindowCommand(apiMethodName);

        return this._enqueueCommand(apiMethodName, CloseWindowCommand, { windowId });
    }

    _getCurrentWindow$ () {
        const apiMethodName = 'getCurrentWindow';

        this._validateMultipleWindowCommand(apiMethodName);

        return this._enqueueCommand(apiMethodName, GetCurrentWindowCommand);
    }

    _switchToWindow$ (windowSelector) {
        const apiMethodName = 'switchToWindow';

        this._validateMultipleWindowCommand(apiMethodName);

        let command;
        let args;

        if (typeof windowSelector === 'function') {
            command = SwitchToWindowByPredicateCommand;

            args = { findWindow: windowSelector };
        }
        else {
            command = SwitchToWindowCommand;

            args = { windowId: windowSelector?.id };
        }

        return this._enqueueCommand(apiMethodName, command, args);
    }

    _switchToParentWindow$ () {
        const apiMethodName = 'switchToParentWindow';

        this._validateMultipleWindowCommand(apiMethodName);

        return this._enqueueCommand(apiMethodName, SwitchToParentWindowCommand);
    }

    _switchToPreviousWindow$ () {
        const apiMethodName = 'switchToPreviousWindow';

        this._validateMultipleWindowCommand(apiMethodName);

        return this._enqueueCommand(apiMethodName, SwitchToPreviousWindowCommand);
    }

    _eval$ (fn, options) {
        if (!isNullOrUndefined(options))
            options = assign({}, options, { boundTestRun: this });

        const builder  = new ClientFunctionBuilder(fn, options, { instantiation: 'eval', execution: 'eval' });
        const clientFn = builder.getFunction();

        return clientFn();
    }

    _setNativeDialogHandler$ (fn, options) {
        return this._enqueueCommand('setNativeDialogHandler', SetNativeDialogHandlerCommand, {
            dialogHandler: { fn, options }
        });
    }

    _getNativeDialogHistory$ () {
        const name     = 'getNativeDialogHistory';
        const callsite = getCallsiteForMethod(name);

        return this.testRun.executeAction(name, new GetNativeDialogHistoryCommand(), callsite);
    }

    _getBrowserConsoleMessages$ () {
        const name     = 'getBrowserConsoleMessages';
        const callsite = getCallsiteForMethod(name);

        return this.testRun.executeAction(name, new GetBrowserConsoleMessagesCommand(), callsite);
    }

    _checkForExcessiveAwaits (snapshotPropertyCallsites, checkedCallsite) {
        const callsiteId = getCallsiteId(checkedCallsite);

        // NOTE: If there are unasserted callsites, we should add all of them to awaitedSnapshotWarnings.
        // The warnings themselves are raised after the test run in wrap-test-function
        if (snapshotPropertyCallsites[callsiteId] && !snapshotPropertyCallsites[callsiteId].checked) {
            for (const propertyCallsite of snapshotPropertyCallsites[callsiteId].callsites)
                this.testRun.observedCallsites.awaitedSnapshotWarnings.set(getCallsiteStackFrameString(propertyCallsite), propertyCallsite);

            delete snapshotPropertyCallsites[callsiteId];
        }
        else
            snapshotPropertyCallsites[callsiteId] = { callsites: [], checked: true };
    }

    _expect$ (actual) {
        const callsite = getCallsiteForMethod('expect');

        this._checkForExcessiveAwaits(this.testRun.observedCallsites.snapshotPropertyCallsites, callsite);

        if (isClientFunction(actual))
            addWarning(this.warningLog, WARNING_MESSAGE.assertedClientFunctionInstance, callsite);
        else if (isSelector(actual))
            addWarning(this.warningLog, WARNING_MESSAGE.assertedSelectorInstance, callsite);

        return new Assertion(actual, this, callsite);
    }

    _debug$ () {
        // NOTE: do not need to enqueue the Debug command if we are in compiler service debugging mode
        // the Debug command will be executed by CDP
        return this.isCompilerServiceMode() ? void 0 : this._enqueueCommand('debug', DebugCommand);
    }

    _setTestSpeed$ (speed) {
        return this._enqueueCommand('setTestSpeed', SetTestSpeedCommand, { speed });
    }

    _setPageLoadTimeout$ (duration) {
        addWarning(this.warningLog, getDeprecationMessage(DEPRECATED.setPageLoadTimeout));

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

    static enableDebugForNonDebugCommands () {
        inDebug = true;
    }

    static disableDebugForNonDebugCommands () {
        inDebug = false;
    }

    shouldStop (command) {
        // NOTE: should never stop in not compliler debugging mode
        if (!this.isCompilerServiceMode())
            return false;

        // NOTE: should always stop on Debug command
        if (command === 'debug')
            return true;

        // NOTE: should stop on other actions after the `Next Action` button is clicked
        if (inDebug) {
            inDebug = false;

            return true;
        }

        return false;
    }

    isCompilerServiceMode () {
        return this.testRun instanceof TestRunProxy;
    }
}

TestController.API_LIST = getDelegatedAPIList(TestController.prototype);

delegateAPI(TestController.prototype, TestController.API_LIST, { useCurrentCtxAsHandler: true });
