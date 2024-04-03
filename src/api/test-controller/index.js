// TODO: Fix https://github.com/DevExpress/testcafe/issues/4139 to get rid of Pinkie
import Promise from 'pinkie';
import {
    identity,
    assign,
    isNil as isNullOrUndefined,
    flattenDeep,
    castArray,
} from 'lodash';

import { getCallsiteForMethod } from '../../errors/get-callsite';
import ClientFunctionBuilder from '../../client-functions/client-function-builder';
import Assertion from './assertion';
import { getDelegatedAPIList, delegateAPI } from '../../utils/delegated-api';
import addWarning from '../../notifications/add-rendered-warning';
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
    GetCurrentCDPSessionCommand,
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
    GetCookiesCommand,
    SetCookiesCommand,
    DeleteCookiesCommand,
    RequestCommand,
    SkipJsErrorsCommand,
    AddRequestHooksCommand,
    RemoveRequestHooksCommand,
    ReportCommand,
} from '../../test-run/commands/actions';

import {
    TakeScreenshotCommand,
    TakeElementScreenshotCommand,
    ResizeWindowCommand,
    ResizeWindowToFitDeviceCommand,
    MaximizeWindowCommand,
} from '../../test-run/commands/browser-manipulation';

import { WaitCommand, DebugCommand } from '../../test-run/commands/observation';
import { createExecutionContext as createContext } from './execution-context';
import { isSelector } from '../../client-functions/types';

import {
    MultipleWindowsModeIsDisabledError,
    MultipleWindowsModeIsNotAvailableInRemoteBrowserError,
    MultipleWindowsModeIsNotSupportedInNativeAutomationModeError,
} from '../../errors/test-run';

import { AssertionCommand } from '../../test-run/commands/assertion';
import { getCallsiteId, getCallsiteStackFrameString } from '../../utils/callsite';
import ReExecutablePromise from '../../utils/re-executable-promise';
import { sendRequestThroughAPI as sendRequest } from '../../test-run/request/send';
import { RequestRuntimeError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';
import CustomActions from './custom-actions';
import delegatedAPI from './delegated-api';
import { getFixtureInfo, getTestInfo } from '../../utils/get-test-and-fixture-info';

const originalThen = Promise.resolve().then;

export default class TestController {
    constructor (testRun) {
        this._executionContext = null;

        this.testRun        = testRun;
        this.executionChain = Promise.resolve();
        this.warningLog     = testRun.warningLog;
        this._customActions = new CustomActions(this, testRun?.opts?.customActions);

        this._addTestControllerToExecutionChain();
    }

    _addTestControllerToExecutionChain () {
        this.executionChain._testController = this;
    }

    // NOTE: TestCafe executes actions and assertions asynchronously in the following cases:
    // a) The `await` keyword that proceeds the method declaration triggers the `then` function of a Promise.
    // b) The action is chained to another `awaited` method.
    //
    // In order to track missing `await` statements, TestCafe exposes a special Promise to the user.
    // When TestCafe detects a missing `await` statement, it compares the method's callsite to the call site of the exposed Promise.
    // This workaround is necessary for situations like these:
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

    _createCommand (CmdCtor, cmdArgs, callsite) {
        try {
            return new CmdCtor(cmdArgs, this.testRun);
        }
        catch (err) {
            err.callsite = callsite;

            throw err;
        }
    }

    _enqueueTask (apiMethodName, createTaskExecutor, callsite) {
        const executor = createTaskExecutor();

        this.executionChain.then = originalThen;
        this.executionChain      = this.executionChain.then(executor);

        this.testRun.observedCallsites.callsitesWithoutAwait.add(callsite);

        this.executionChain = this._createExtendedPromise(this.executionChain, callsite);

        this._addTestControllerToExecutionChain();

        return this.executionChain;
    }

    enqueueCommand (CmdCtor, cmdArgs, validateCommandFn, callsite) {
        callsite = callsite || getCallsiteForMethod(CmdCtor.methodName);

        const command = this._createCommand(CmdCtor, cmdArgs, callsite);

        if (typeof validateCommandFn === 'function')
            validateCommandFn(this, command, callsite);

        return this._enqueueTask(command.methodName, () => {
            return () => {
                return this.testRun.executeCommand(command, callsite)
                    .catch(err => {
                        this.executionChain = Promise.resolve();

                        throw err;
                    });
            };
        }, callsite);
    }

    _validateMultipleWindowCommand (apiMethodName) {
        const { disableMultipleWindows, activeWindowId } = this.testRun;

        if (this.testRun.isNativeAutomation && !this.testRun.isExperimentalMultipleWindows)
            throw new MultipleWindowsModeIsNotSupportedInNativeAutomationModeError(apiMethodName);

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

    _customActions$getter () {
        return this._customActions || new CustomActions(this, this.testRun.opts.customActions);
    }

    _test$getter () {
        return getTestInfo(this.testRun);
    }

    _fixture$getter () {
        return getFixtureInfo(this.testRun);
    }

    [delegatedAPI(DispatchEventCommand.methodName)] (selector, eventName, options = {}) {
        return this.enqueueCommand(DispatchEventCommand, { selector, eventName, options, relatedTarget: options.relatedTarget });
    }

    _prepareCookieArguments (args, isSetCommand = false) {
        const urlsArg = castArray(args[1]);
        const urls    = Array.isArray(urlsArg) && typeof urlsArg[0] === 'string' ? urlsArg : [];

        const cookiesArg = urls.length ? args[0] : args;
        const cookies    = [];

        flattenDeep(castArray(cookiesArg)).forEach(cookie => {
            if (isSetCommand && !cookie.name && typeof cookie === 'object')
                Object.entries(cookie).forEach(([name, value]) => cookies.push({ name, value }));
            else if (!isSetCommand && typeof cookie === 'string')
                cookies.push({ name: cookie });
            else
                cookies.push(cookie);
        });

        return { urls, cookies };
    }

    [delegatedAPI(GetCookiesCommand.methodName)] (...args) {
        return this.enqueueCommand(GetCookiesCommand, this._prepareCookieArguments(args));
    }

    [delegatedAPI(SetCookiesCommand.methodName)] (...args) {
        const { urls, cookies } = this._prepareCookieArguments(args, true);

        return this.enqueueCommand(SetCookiesCommand, { cookies, url: urls[0] });
    }

    [delegatedAPI(DeleteCookiesCommand.methodName)] (...args) {
        return this.enqueueCommand(DeleteCookiesCommand, this._prepareCookieArguments(args));
    }

    _prepareRequestArguments (bindOptions, ...args) {
        const [url, options] = typeof args[0] === 'object' ? [args[0].url, args[0]] : args;

        return {
            url,
            options: Object.assign({}, options, bindOptions),
        };
    }

    _createRequestFunction (bindOptions = {}) {
        const controller = this;
        const callsite   = getCallsiteForMethod(RequestCommand.methodName);

        if (!controller.testRun)
            throw new RequestRuntimeError(callsite, RUNTIME_ERRORS.requestCannotResolveTestRun);

        return function (...args) {
            const cmdArgs = controller._prepareRequestArguments(bindOptions, ...args);
            const command = controller._createCommand(RequestCommand, cmdArgs, callsite);

            const options = {
                ...command.options,
                url: command.url || command.options.url || '',
            };

            const promise = ReExecutablePromise.fromFn(async () => {
                return sendRequest(controller.testRun, options, callsite);
            });

            RequestCommand.resultGetters.forEach(getter => {
                Object.defineProperty(promise, getter, {
                    get: () => ReExecutablePromise.fromFn(async () => {
                        const response = await sendRequest(controller.testRun, options, callsite);

                        return response[getter];
                    }),
                });
            });

            return promise;
        };
    }

    _decorateRequestFunction (fn) {
        RequestCommand.extendedMethods.forEach(method => {
            Object.defineProperty(fn, method, {
                value: this._createRequestFunction({ method }),
            });
        });
    }

    [delegatedAPI(RequestCommand.methodName, 'getter')] () {
        const fn = this._createRequestFunction();

        this._decorateRequestFunction(fn);

        return fn;
    }

    [delegatedAPI(ClickCommand.methodName)] (selector, options) {
        return this.enqueueCommand(ClickCommand, { selector, options });
    }

    [delegatedAPI(RightClickCommand.methodName)] (selector, options) {
        return this.enqueueCommand(RightClickCommand, { selector, options });
    }

    [delegatedAPI(DoubleClickCommand.methodName)] (selector, options) {
        return this.enqueueCommand(DoubleClickCommand, { selector, options });
    }

    [delegatedAPI(HoverCommand.methodName)] (selector, options) {
        return this.enqueueCommand(HoverCommand, { selector, options });
    }

    [delegatedAPI(DragCommand.methodName)] (selector, dragOffsetX, dragOffsetY, options) {
        return this.enqueueCommand(DragCommand, { selector, dragOffsetX, dragOffsetY, options });
    }

    [delegatedAPI(DragToElementCommand.methodName)] (selector, destinationSelector, options) {
        return this.enqueueCommand(DragToElementCommand, { selector, destinationSelector, options });
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

        return this.enqueueCommand(ScrollCommand, { selector, x, y, position, options });
    }

    [delegatedAPI(ScrollByCommand.methodName)] (...args) {
        const selector = this._getSelectorForScroll(args);

        const [byX, byY, options] = args;

        return this.enqueueCommand(ScrollByCommand, { selector, byX, byY, options });
    }

    [delegatedAPI(ScrollIntoViewCommand.methodName)] (selector, options) {
        return this.enqueueCommand(ScrollIntoViewCommand, { selector, options });
    }

    [delegatedAPI(TypeTextCommand.methodName)] (selector, text, options) {
        return this.enqueueCommand(TypeTextCommand, { selector, text, options });
    }

    [delegatedAPI(SelectTextCommand.methodName)] (selector, startPos, endPos, options) {
        return this.enqueueCommand(SelectTextCommand, { selector, startPos, endPos, options });
    }

    [delegatedAPI(SelectTextAreaContentCommand.methodName)] (selector, startLine, startPos, endLine, endPos, options) {
        return this.enqueueCommand(SelectTextAreaContentCommand, {
            selector,
            startLine,
            startPos,
            endLine,
            endPos,
            options,
        });
    }

    [delegatedAPI(SelectEditableContentCommand.methodName)] (startSelector, endSelector, options) {
        return this.enqueueCommand(SelectEditableContentCommand, {
            startSelector,
            endSelector,
            options,
        });
    }

    [delegatedAPI(PressKeyCommand.methodName)] (keys, options) {
        return this.enqueueCommand(PressKeyCommand, { keys, options });
    }

    [delegatedAPI(WaitCommand.methodName)] (timeout) {
        return this.enqueueCommand(WaitCommand, { timeout });
    }

    [delegatedAPI(NavigateToCommand.methodName)] (url) {
        return this.enqueueCommand(NavigateToCommand, { url });
    }

    [delegatedAPI(SetFilesToUploadCommand.methodName)] (selector, filePath) {
        return this.enqueueCommand(SetFilesToUploadCommand, { selector, filePath });
    }

    [delegatedAPI(ClearUploadCommand.methodName)] (selector) {
        return this.enqueueCommand(ClearUploadCommand, { selector });
    }

    [delegatedAPI(TakeScreenshotCommand.methodName)] (options) {
        if (options && typeof options !== 'object')
            options = { path: options };

        return this.enqueueCommand(TakeScreenshotCommand, options);
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

        return this.enqueueCommand(TakeElementScreenshotCommand, commandArgs);
    }

    [delegatedAPI(ResizeWindowCommand.methodName)] (width, height) {
        return this.enqueueCommand(ResizeWindowCommand, { width, height });
    }

    [delegatedAPI(ResizeWindowToFitDeviceCommand.methodName)] (device, options) {
        return this.enqueueCommand(ResizeWindowToFitDeviceCommand, { device, options });
    }

    [delegatedAPI(MaximizeWindowCommand.methodName)] () {
        return this.enqueueCommand(MaximizeWindowCommand);
    }

    [delegatedAPI(SwitchToIframeCommand.methodName)] (selector) {
        return this.enqueueCommand(SwitchToIframeCommand, { selector });
    }

    [delegatedAPI(SwitchToMainWindowCommand.methodName)] () {
        return this.enqueueCommand(SwitchToMainWindowCommand);
    }

    [delegatedAPI(OpenWindowCommand.methodName)] (url) {
        this._validateMultipleWindowCommand(OpenWindowCommand.methodName);

        return this.enqueueCommand(OpenWindowCommand, { url });
    }

    [delegatedAPI(CloseWindowCommand.methodName)] (window) {
        const windowId = window?.id || null;

        this._validateMultipleWindowCommand(CloseWindowCommand.methodName);

        return this.enqueueCommand(CloseWindowCommand, { windowId });
    }

    [delegatedAPI(GetCurrentWindowCommand.methodName)] () {
        this._validateMultipleWindowCommand(GetCurrentWindowCommand.methodName);

        return this.enqueueCommand(GetCurrentWindowCommand);
    }

    [delegatedAPI(GetCurrentCDPSessionCommand.methodName)] () {
        const callsite = getCallsiteForMethod(GetCurrentCDPSessionCommand.methodName);
        const command  = this._createCommand(GetCurrentCDPSessionCommand, {}, callsite);

        return this.testRun.executeCommand(command, callsite);
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

        return this.enqueueCommand(command, args);
    }

    [delegatedAPI(SwitchToParentWindowCommand.methodName)] () {
        this._validateMultipleWindowCommand(SwitchToParentWindowCommand.methodName);

        return this.enqueueCommand(SwitchToParentWindowCommand);
    }

    [delegatedAPI(SwitchToPreviousWindowCommand.methodName)] () {
        this._validateMultipleWindowCommand(SwitchToPreviousWindowCommand.methodName);

        return this.enqueueCommand(SwitchToPreviousWindowCommand);
    }

    _eval$ (fn, options) {
        if (!isNullOrUndefined(options))
            options = assign({}, options, { boundTestRun: this });

        const builder  = new ClientFunctionBuilder(fn, options, { instantiation: 'eval', execution: 'eval' });
        const clientFn = builder.getFunction();

        return clientFn();
    }

    [delegatedAPI(SetNativeDialogHandlerCommand.methodName)] (fn, options) {
        return this.enqueueCommand(SetNativeDialogHandlerCommand, {
            dialogHandler: { fn, options },
        });
    }

    [delegatedAPI(GetNativeDialogHistoryCommand.methodName)] () {
        const callsite = getCallsiteForMethod(GetNativeDialogHistoryCommand.methodName);
        const command  = this._createCommand(GetNativeDialogHistoryCommand, {}, callsite);

        return this.testRun.executeCommand(command, callsite);
    }

    [delegatedAPI(GetBrowserConsoleMessagesCommand.methodName)] () {
        const callsite = getCallsiteForMethod(GetBrowserConsoleMessagesCommand.methodName);
        const command  = this._createCommand(GetBrowserConsoleMessagesCommand, {}, callsite);

        return this.testRun.executeCommand(command, callsite);
    }

    checkForExcessiveAwaits (checkedCallsite, { actionId }) {
        const snapshotPropertyCallsites = this.testRun.observedCallsites.snapshotPropertyCallsites;
        const callsiteId                = getCallsiteId(checkedCallsite);

        // NOTE: If there are unasserted callsites, we should add all of them to awaitedSnapshotWarnings.
        // The warnings themselves are raised after the test run in wrap-test-function
        if (snapshotPropertyCallsites[callsiteId] && !snapshotPropertyCallsites[callsiteId].checked) {
            for (const propertyCallsite of snapshotPropertyCallsites[callsiteId].callsites)
                this.testRun.observedCallsites.awaitedSnapshotWarnings.set(getCallsiteStackFrameString(propertyCallsite), { callsite: propertyCallsite, actionId });

            delete snapshotPropertyCallsites[callsiteId];
        }
        else
            snapshotPropertyCallsites[callsiteId] = { callsites: [], checked: true };
    }

    [delegatedAPI(AssertionCommand.methodName)] (actual) {
        const callsite = getCallsiteForMethod(AssertionCommand.methodName);

        return new Assertion(actual, this, callsite);
    }

    [delegatedAPI(DebugCommand.methodName)] (selector) {
        return this.enqueueCommand(DebugCommand, { selector });
    }

    [delegatedAPI(SetTestSpeedCommand.methodName)] (speed) {
        return this.enqueueCommand(SetTestSpeedCommand, { speed });
    }

    [delegatedAPI(SetPageLoadTimeoutCommand.methodName)] (duration) {
        return this.enqueueCommand(SetPageLoadTimeoutCommand, { duration }, (testController, command) => {
            addWarning(testController.warningLog, { message: getDeprecationMessage(DEPRECATED.setPageLoadTimeout), actionId: command.actionId });
        });
    }

    [delegatedAPI(UseRoleCommand.methodName)] (role) {
        return this.enqueueCommand(UseRoleCommand, { role });
    }

    [delegatedAPI(SkipJsErrorsCommand.methodName)] (options) {
        return this.enqueueCommand(SkipJsErrorsCommand, { options });
    }

    [delegatedAPI(AddRequestHooksCommand.methodName)] (...hooks) {
        hooks = flattenDeep(hooks);

        return this.enqueueCommand(AddRequestHooksCommand, { hooks });
    }

    [delegatedAPI(RemoveRequestHooksCommand.methodName)] (...hooks) {
        hooks = flattenDeep(hooks);

        return this.enqueueCommand(RemoveRequestHooksCommand, { hooks });
    }

    [delegatedAPI(ReportCommand.methodName)] (...args) {
        return this.enqueueCommand(ReportCommand, { args });
    }
    shouldStop (command) {
        // NOTE: should always stop on Debug command
        return command === 'debug';
    }
}

TestController.API_LIST = getDelegatedAPIList(TestController.prototype);

delegateAPI(TestController.prototype, TestController.API_LIST, { useCurrentCtxAsHandler: true });
