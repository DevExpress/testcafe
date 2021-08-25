// TODO: Fix https://github.com/DevExpress/testcafe/issues/4139 to get rid of Pinkie
import Promise from 'pinkie';
import {
    identity,
    assign,
    isNil as isNullOrUndefined,
    flattenDeep as flatten,
} from 'lodash';

import { getCallsiteForMethod } from '../../errors/get-callsite';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import Assertion from './assertion';
import { getDelegatedAPIList, delegateAPI } from '../../utils/delegated-api';
import WARNING_MESSAGE from '../../notifications/warning-message';
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
    DispatchEventCommand,
} from '../../test-run/commands/actions';

import {
    TakeScreenshotCommand,
    TakeElementScreenshotCommand,
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand,
    MaximizeWindowCommand,
} from '../../test-run/commands/browser-manipulation';

import { WaitCommand, DebugCommand } from '../../test-run/commands/observation';
import assertRequestHookType from '../request-hooks/assert-type';
import { createExecutionContext as createContext } from './execution-context';
import { isClientFunction, isSelector } from '../../client-functions/types';
import TestRunProxy from '../../services/compiler/test-run-proxy';

import {
    MultipleWindowsModeIsDisabledError,
    MultipleWindowsModeIsNotAvailableInRemoteBrowserError,
} from '../../errors/test-run';
import { AssertionCommand } from '../../test-run/commands/assertion';

const originalThen = Promise.resolve().then;

let inDebug = false;

function delegatedAPI (methodName) {
    return `_${methodName}$`;
}

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
            proxyMethod: markCallsiteAwaited,
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

    _enqueueCommand (CmdCtor, cmdArgs) {
        return this._enqueueTask(CmdCtor.methodName, callsite => {
            let command = null;

            try {
                command = new CmdCtor(cmdArgs, this.testRun);
            }
            catch (err) {
                err.callsite = callsite;
                throw err;
            }

            return () => {
                return this.testRun.executeCommand(command, callsite)
                    .catch(err => {
                        this.executionChain = Promise.resolve();

                        throw err;
                    });
            };
        });
    }

    _validateMultipleWindowCommand (apiMethodName) {
        const { disableMultipleWindows, activeWindowId } = this.testRun;

        if (disableMultipleWindows)
            throw new MultipleWindowsModeIsDisabledError(apiMethodName);

        if (!activeWindowId)
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
        return this.testRun.browser;
    }

    [delegatedAPI(DispatchEventCommand.methodName)] (selector, eventName, options = {}) {
        return this._enqueueCommand(DispatchEventCommand, { selector, eventName, options, relatedTarget: options.relatedTarget });
    }

    [delegatedAPI(ClickCommand.methodName)] (selector, options) {
        return this._enqueueCommand(ClickCommand, { selector, options });
    }

    [delegatedAPI(RightClickCommand.methodName)] (selector, options) {
        return this._enqueueCommand(RightClickCommand, { selector, options });
    }

    [delegatedAPI(DoubleClickCommand.methodName)] (selector, options) {
        return this._enqueueCommand(DoubleClickCommand, { selector, options });
    }

    [delegatedAPI(HoverCommand.methodName)] (selector, options) {
        return this._enqueueCommand(HoverCommand, { selector, options });
    }

    [delegatedAPI(DragCommand.methodName)] (selector, dragOffsetX, dragOffsetY, options) {
        return this._enqueueCommand(DragCommand, { selector, dragOffsetX, dragOffsetY, options });
    }

    [delegatedAPI(DragToElementCommand.methodName)] (selector, destinationSelector, options) {
        return this._enqueueCommand(DragToElementCommand, { selector, destinationSelector, options });
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

    [delegatedAPI(ScrollCommand.methodName)] (...args) {
        let position = this._getPosition(args);

        const selector = this._getSelectorForScroll(args);

        let x       = void 0;
        let y       = void 0;
        let options = void 0;

        if (typeof args[0] === 'string')
            [ position, options ] = args;

        if (typeof args[0] === 'number')
            [ x, y, options ] = args;

        return this._enqueueCommand(ScrollCommand, { selector, x, y, position, options });
    }

    [delegatedAPI(ScrollByCommand.methodName)] (...args) {
        const selector = this._getSelectorForScroll(args);

        const [byX, byY, options] = args;

        return this._enqueueCommand(ScrollByCommand, { selector, byX, byY, options });
    }

    [delegatedAPI(ScrollIntoViewCommand.methodName)] (selector, options) {
        return this._enqueueCommand(ScrollIntoViewCommand, { selector, options });
    }

    [delegatedAPI(TypeTextCommand.methodName)] (selector, text, options) {
        return this._enqueueCommand(TypeTextCommand, { selector, text, options });
    }

    [delegatedAPI(SelectTextCommand.methodName)] (selector, startPos, endPos, options) {
        return this._enqueueCommand(SelectTextCommand, { selector, startPos, endPos, options });
    }

    [delegatedAPI(SelectTextAreaContentCommand.methodName)] (selector, startLine, startPos, endLine, endPos, options) {
        return this._enqueueCommand(SelectTextAreaContentCommand, {
            selector,
            startLine,
            startPos,
            endLine,
            endPos,
            options,
        });
    }

    [delegatedAPI(SelectEditableContentCommand.methodName)] (startSelector, endSelector, options) {
        return this._enqueueCommand(SelectEditableContentCommand, {
            startSelector,
            endSelector,
            options,
        });
    }

    [delegatedAPI(PressKeyCommand.methodName)] (keys, options) {
        return this._enqueueCommand(PressKeyCommand, { keys, options });
    }

    [delegatedAPI(WaitCommand.methodName)] (timeout) {
        return this._enqueueCommand(WaitCommand, { timeout });
    }

    [delegatedAPI(NavigateToCommand.methodName)] (url) {
        return this._enqueueCommand(NavigateToCommand, { url });
    }

    [delegatedAPI(SetFilesToUploadCommand.methodName)] (selector, filePath) {
        return this._enqueueCommand(SetFilesToUploadCommand, { selector, filePath });
    }

    [delegatedAPI(ClearUploadCommand.methodName)] (selector) {
        return this._enqueueCommand(ClearUploadCommand, { selector });
    }

    [delegatedAPI(TakeScreenshotCommand.methodName)] (options) {
        if (options && typeof options !== 'object')
            options = { path: options };

        return this._enqueueCommand(TakeScreenshotCommand, options);
    }

    [delegatedAPI(TakeElementScreenshotCommand.methodName)] (selector, ...args) {
        const commandArgs = { selector };

        if (args[1]) {
            commandArgs.path    = args[0];
            commandArgs.options = args[1];
        }
        else if (typeof args[0] === 'object')
            commandArgs.options = args[0];
        else
            commandArgs.path = args[0];

        return this._enqueueCommand(TakeElementScreenshotCommand, commandArgs);
    }

    [delegatedAPI(ResizeWindowCommand.methodName)] (width, height) {
        return this._enqueueCommand(ResizeWindowCommand, { width, height });
    }

    [delegatedAPI(ResizeWindowToFitDeviceCommand.methodName)] (device, options) {
        return this._enqueueCommand(ResizeWindowToFitDeviceCommand, { device, options });
    }

    [delegatedAPI(MaximizeWindowCommand.methodName)] () {
        return this._enqueueCommand(MaximizeWindowCommand);
    }

    [delegatedAPI(SwitchToIframeCommand.methodName)] (selector) {
        return this._enqueueCommand(SwitchToIframeCommand, { selector });
    }

    [delegatedAPI(SwitchToMainWindowCommand.methodName)] () {
        return this._enqueueCommand(SwitchToMainWindowCommand);
    }

    [delegatedAPI(OpenWindowCommand.methodName)] (url) {
        this._validateMultipleWindowCommand(OpenWindowCommand.methodName);

        return this._enqueueCommand(OpenWindowCommand, { url });
    }

    [delegatedAPI(CloseWindowCommand.methodName)] (window) {
        const windowId      = window?.id || null;

        this._validateMultipleWindowCommand(CloseWindowCommand.methodName);

        return this._enqueueCommand(CloseWindowCommand, { windowId });
    }

    [delegatedAPI(GetCurrentWindowCommand.methodName)] () {
        this._validateMultipleWindowCommand(GetCurrentWindowCommand.methodName);

        return this._enqueueCommand(GetCurrentWindowCommand);
    }

    [delegatedAPI(SwitchToWindowCommand.methodName)] (windowSelector) {
        this._validateMultipleWindowCommand(SwitchToWindowCommand.methodName);

        let command;
        let args;

        if (typeof windowSelector === 'function') {
            command = SwitchToWindowByPredicateCommand;

            args = { checkWindow: windowSelector };
        }
        else {
            command = SwitchToWindowCommand;

            args = { windowId: windowSelector?.id };
        }

        return this._enqueueCommand(command, args);
    }

    [delegatedAPI(SwitchToParentWindowCommand.methodName)] () {
        this._validateMultipleWindowCommand(SwitchToParentWindowCommand.methodName);

        return this._enqueueCommand(SwitchToParentWindowCommand);
    }

    [delegatedAPI(SwitchToPreviousWindowCommand.methodName)] () {
        this._validateMultipleWindowCommand(SwitchToPreviousWindowCommand.methodName);

        return this._enqueueCommand(SwitchToPreviousWindowCommand);
    }

    _eval$ (fn, options) {
        if (!isNullOrUndefined(options))
            options = assign({}, options, { boundTestRun: this });

        const builder  = new ClientFunctionBuilder(fn, options, { instantiation: 'eval', execution: 'eval' });
        const clientFn = builder.getFunction();

        return clientFn();
    }

    [delegatedAPI(SetNativeDialogHandlerCommand.methodName)] (fn, options) {
        return this._enqueueCommand(SetNativeDialogHandlerCommand, {
            dialogHandler: { fn, options },
        });
    }

    [delegatedAPI(GetNativeDialogHistoryCommand.methodName)] () {
        const callsite = getCallsiteForMethod(GetNativeDialogHistoryCommand.methodName);

        return this.testRun.executeCommand(new GetNativeDialogHistoryCommand(), callsite);
    }

    [delegatedAPI(GetBrowserConsoleMessagesCommand.methodName)] () {
        const callsite = getCallsiteForMethod(GetBrowserConsoleMessagesCommand.methodName);

        return this.testRun.executeCommand(new GetBrowserConsoleMessagesCommand(), callsite);
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

    [delegatedAPI(AssertionCommand.methodName)] (actual) {
        const callsite = getCallsiteForMethod(AssertionCommand.methodName);

        this._checkForExcessiveAwaits(this.testRun.observedCallsites.snapshotPropertyCallsites, callsite);

        if (isClientFunction(actual))
            addWarning(this.warningLog, WARNING_MESSAGE.assertedClientFunctionInstance, callsite);
        else if (isSelector(actual))
            addWarning(this.warningLog, WARNING_MESSAGE.assertedSelectorInstance, callsite);

        return new Assertion(actual, this, callsite);
    }

    [delegatedAPI(DebugCommand.methodName)] () {
        // NOTE: do not need to enqueue the Debug command if we are in compiler service debugging mode
        // the Debug command will be executed by CDP
        return this.isCompilerServiceMode() ? void 0 : this._enqueueCommand(DebugCommand);
    }

    [delegatedAPI(SetTestSpeedCommand.methodName)] (speed) {
        return this._enqueueCommand(SetTestSpeedCommand, { speed });
    }

    [delegatedAPI(SetPageLoadTimeoutCommand.methodName)] (duration) {
        addWarning(this.warningLog, getDeprecationMessage(DEPRECATED.setPageLoadTimeout));

        return this._enqueueCommand(SetPageLoadTimeoutCommand, { duration });
    }

    [delegatedAPI(UseRoleCommand.methodName)] (role) {
        return this._enqueueCommand(UseRoleCommand, { role });
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
