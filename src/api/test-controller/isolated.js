// IsolatedTestController — test controller for CDP-isolated browser sessions (t2 API)
//
// The t2 object returned by t.openIsolatedSession(). Mirrors TestController's
// delegatedAPI pattern but routes commands to IsolatedSession.executeCommand()
// instead of TestRun.executeCommand(). Supports the same promise-chain pattern
// as the main t controller.
//
// TODO: Fix https://github.com/DevExpress/testcafe/issues/4139 to get rid of Pinkie
import Promise from 'pinkie';
import {
    identity,
    flattenDeep,
    castArray,
} from 'lodash';

import { getCallsiteForMethod } from '../../errors/get-callsite';
import Assertion from './assertion';
import { getDelegatedAPIList, delegateAPI } from '../../utils/delegated-api';
import delegatedAPI from './delegated-api';
import testRunTracker from '../../api/test-run-tracker';

import {
    ClickCommand,
    RightClickCommand,
    DoubleClickCommand,
    HoverCommand,
    DragCommand,
    DragToElementCommand,
    TypeTextCommand,
    PressKeyCommand,
    SelectTextCommand,
    ScrollCommand,
    ScrollByCommand,
    ScrollIntoViewCommand,
    DispatchEventCommand,
    NavigateToCommand,
    UseRoleCommand,
    GetCookiesCommand,
    SetCookiesCommand,
    DeleteCookiesCommand,
} from '../../test-run/commands/actions';

import { WaitCommand } from '../../test-run/commands/observation';
import { AssertionCommand } from '../../test-run/commands/assertion';

const originalThen = Promise.resolve().then;

export class IsolatedTestController {
    constructor (isolatedSession) {
        this._session       = isolatedSession;
        this.executionChain = Promise.resolve();
        this.warningLog     = isolatedSession.parentTestRun.warningLog;
        this._directMode    = false;

        this._addTestControllerToExecutionChain();
    }

    _addTestControllerToExecutionChain () {
        this.executionChain._testController = this;
    }

    _createCommand (CmdCtor, cmdArgs, callsite) {
        try {
            // Pass the parent test run for validation context
            return new CmdCtor(cmdArgs, this._session.parentTestRun);
        }
        catch (err) {
            err.callsite = callsite;

            throw err;
        }
    }

    _enqueueTask (apiMethodName, createTaskExecutor, callsite) {
        const executor = createTaskExecutor();

        // Direct mode: execute immediately, bypass chain (avoids deadlock inside _run$)
        if (this._directMode)
            return executor();

        this.executionChain.then = originalThen;
        this.executionChain      = this.executionChain.then(executor);

        this.executionChain = this._createExtendedPromise(this.executionChain, callsite);

        this._addTestControllerToExecutionChain();

        return this.executionChain;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _createExtendedPromise (promise, callsite) {
        const extendedPromise = promise.then(identity);

        delegateAPI(extendedPromise, IsolatedTestController.API_LIST, {
            handler:     this,
            proxyMethod: () => {},
        });

        return extendedPromise;
    }

    enqueueCommand (CmdCtor, cmdArgs, validateCommandFn, callsite) {
        callsite = callsite || getCallsiteForMethod(CmdCtor.methodName);

        const command = this._createCommand(CmdCtor, cmdArgs, callsite);

        if (typeof validateCommandFn === 'function')
            validateCommandFn(this, command, callsite);

        return this._enqueueTask(command.methodName, () => {
            return () => {
                return this._session.executeCommand(command, callsite)
                    .catch(err => {
                        this.executionChain = Promise.resolve();

                        throw err;
                    });
            };
        }, callsite);
    }

    // No-op stub — IsolatedTestController does not track excessive awaits
    // Required by Assertion._checkForWarnings
    checkForExcessiveAwaits () {}

    // =====================================================================
    // Cookie operations
    // =====================================================================

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

    // =====================================================================
    // Mouse interactions
    // =====================================================================

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

    // =====================================================================
    // Keyboard interactions
    // =====================================================================

    [delegatedAPI(TypeTextCommand.methodName)] (selector, text, options) {
        return this.enqueueCommand(TypeTextCommand, { selector, text, options });
    }

    [delegatedAPI(PressKeyCommand.methodName)] (keys, options) {
        return this.enqueueCommand(PressKeyCommand, { keys, options });
    }

    [delegatedAPI(SelectTextCommand.methodName)] (selector, startPos, endPos, options) {
        return this.enqueueCommand(SelectTextCommand, { selector, startPos, endPos, options });
    }

    // =====================================================================
    // Scroll
    // =====================================================================

    [delegatedAPI(ScrollCommand.methodName)] (selectorOrX, positionOrY, options) {
        // Overloaded: scroll(selector, position) or scroll(x, y)
        if (typeof selectorOrX === 'number')
            return this.enqueueCommand(ScrollCommand, { x: selectorOrX, y: positionOrY, options });

        return this.enqueueCommand(ScrollCommand, { selector: selectorOrX, position: positionOrY, options });
    }

    [delegatedAPI(ScrollByCommand.methodName)] (selectorOrByX, byXOrByY, byYOrOptions, options) {
        // Overloaded: scrollBy(selector, byX, byY, opts) or scrollBy(byX, byY, opts)
        if (typeof selectorOrByX === 'number')
            return this.enqueueCommand(ScrollByCommand, { byX: selectorOrByX, byY: byXOrByY, options: byYOrOptions });

        return this.enqueueCommand(ScrollByCommand, { selector: selectorOrByX, byX: byXOrByY, byY: byYOrOptions, options });
    }

    [delegatedAPI(ScrollIntoViewCommand.methodName)] (selector, options) {
        return this.enqueueCommand(ScrollIntoViewCommand, { selector, options });
    }

    // =====================================================================
    // Events
    // =====================================================================

    [delegatedAPI(DispatchEventCommand.methodName)] (selector, eventName, options) {
        return this.enqueueCommand(DispatchEventCommand, { selector, eventName, options });
    }

    // =====================================================================
    // Navigation & timing
    // =====================================================================

    [delegatedAPI(WaitCommand.methodName)] (timeout) {
        return this.enqueueCommand(WaitCommand, { timeout });
    }

    [delegatedAPI(NavigateToCommand.methodName)] (url) {
        return this.enqueueCommand(NavigateToCommand, { url });
    }

    // =====================================================================
    // Assertions
    // =====================================================================

    [delegatedAPI(AssertionCommand.methodName)] (actual) {
        const callsite = getCallsiteForMethod(AssertionCommand.methodName);

        return new Assertion(actual, this, callsite);
    }

    // =====================================================================
    // Roles
    // =====================================================================

    [delegatedAPI(UseRoleCommand.methodName)] (role) {
        return this.enqueueCommand(UseRoleCommand, { role });
    }

    // =====================================================================
    // Direct session methods (bypass command system)
    // These use _name$ convention: exposed as t2.name() via delegateAPI
    // =====================================================================

    _setWindowBounds$ (bounds) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('setWindowBounds');

        return this._enqueueTask('setWindowBounds', () => {
            return async () => {
                await session.setWindowBounds(bounds);
            };
        }, callsite);
    }

    _setHttpAuth$ (username, password) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('setHttpAuth');

        return this._enqueueTask('setHttpAuth', () => {
            return async () => {
                await session.setHttpAuth(username, password);
            };
        }, callsite);
    }

    _eval$ (fn) {
        // Execute via CDP directly in the isolated tab
        const session  = this._session;
        const callsite = getCallsiteForMethod('eval');

        return this._enqueueTask('eval', () => {
            return async () => {
                const expression = `(${fn.toString()})()`;

                return session._evaluateExpression(expression);
            };
        }, callsite);
    }

    _takeScreenshot$ (filePath) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('takeScreenshot');

        return this._enqueueTask('takeScreenshot', () => {
            return async () => {
                return session.takeScreenshot(filePath);
            };
        }, callsite);
    }

    _maximizeWindow$ () {
        const session  = this._session;
        const callsite = getCallsiteForMethod('maximizeWindow');

        return this._enqueueTask('maximizeWindow', () => {
            return async () => {
                await session.maximizeWindow();
            };
        }, callsite);
    }

    _resizeWindow$ (width, height) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('resizeWindow');

        return this._enqueueTask('resizeWindow', () => {
            return async () => {
                await session.resizeWindow(width, height);
            };
        }, callsite);
    }

    _switchToIframe$ (selector) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('switchToIframe');

        return this._enqueueTask('switchToIframe', () => {
            return async () => {
                await session.switchToIframe(selector);
            };
        }, callsite);
    }

    _switchToMainWindow$ () {
        const session  = this._session;
        const callsite = getCallsiteForMethod('switchToMainWindow');

        return this._enqueueTask('switchToMainWindow', () => {
            return async () => {
                await session.switchToMainWindow();
            };
        }, callsite);
    }

    _takeElementScreenshot$ (selector, filePath) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('takeElementScreenshot');

        return this._enqueueTask('takeElementScreenshot', () => {
            return async () => {
                return session.takeElementScreenshot(selector, filePath);
            };
        }, callsite);
    }

    _setFilesToUpload$ (selector, filePaths) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('setFilesToUpload');

        return this._enqueueTask('setFilesToUpload', () => {
            return async () => {
                await session.setFilesToUpload(selector, filePaths);
            };
        }, callsite);
    }

    _clearUpload$ (selector) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('clearUpload');

        return this._enqueueTask('clearUpload', () => {
            return async () => {
                await session.clearUpload(selector);
            };
        }, callsite);
    }

    _setPageLoadTimeout$ (timeout) {
        const session  = this._session;
        const callsite = getCallsiteForMethod('setPageLoadTimeout');

        return this._enqueueTask('setPageLoadTimeout', () => {
            return async () => {
                session.setPageLoadTimeout(timeout);
            };
        }, callsite);
    }

    // =====================================================================
    // t2.run() — Execute a callback where the global `t` and selector
    // evaluation target the isolated session's CDP tab.
    //
    // Usage:
    //   await t2.run(async () => {
    //     await t.click(selector)          // → clicks in isolated tab
    //     await t.expect(sel.exists).ok()   // → checks DOM in isolated tab
    //     await waitForElementVisible(sel)  // → polls DOM in isolated tab
    //   })
    // =====================================================================

    _run$ (fn) {
        const session  = this._session;
        const testRun  = session.parentTestRun;
        const self     = this;
        const callsite = getCallsiteForMethod('run');

        return this._enqueueTask('run', () => {
            return async () => {
                // Save originals
                const originalController     = testRun.controller;
                const originalExecuteCommand = testRun.executeCommand.bind(testRun);

                try {
                    // 1) Swap controller so global `t` resolves to this IsolatedTestController
                    testRun.controller = self;

                    // 2) Enable direct mode so commands inside the callback execute
                    //    immediately instead of appending to the executionChain (which
                    //    would deadlock since we're already inside a chain task)
                    self._directMode = true;

                    // 3) Patch executeCommand to intercept selector/ClientFunction commands
                    testRun.executeCommand = async (command, cmdCallsite) => {
                        if (command.type === 'execute-selector')
                            return session._executeSelectorViaCDP(command);

                        if (command.type === 'execute-client-function')
                            return session._executeClientFunctionViaCDP(command);

                        // All other commands: use the original (or route through isolated session)
                        return originalExecuteCommand(command, cmdCallsite);
                    };

                    // 4) Run the user callback with testRunTracker context
                    //    so that the global `t` proxy can resolve the test run
                    const wrappedFn = testRunTracker.addTrackingMarkerToFunction(testRun.id, fn);

                    await wrappedFn();
                }
                finally {
                    // 5) Restore originals
                    self._directMode       = false;
                    testRun.controller     = originalController;
                    testRun.executeCommand = originalExecuteCommand;
                }
            };
        }, callsite);
    }

    shouldStop (command) {
        return command === 'debug';
    }
}

IsolatedTestController.API_LIST = getDelegatedAPIList(IsolatedTestController.prototype);

delegateAPI(IsolatedTestController.prototype, IsolatedTestController.API_LIST, { useCurrentCtxAsHandler: true });
