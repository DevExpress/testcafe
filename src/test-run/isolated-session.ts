import { nanoid } from 'nanoid';
import { noop } from 'lodash';
import { ProtocolApi } from 'chrome-remote-interface';
import AsyncEventEmitter from '../utils/async-event-emitter';
import { NativeAutomationIsolatedWindow } from '../native-automation/isolated-window';
import { CommandBase, ActionCommandBase } from './commands/base.js';
import COMMAND_TYPE from './commands/type';
import { CallsiteRecord } from '@devexpress/callsite-record';
import delay from '../utils/delay';
import getFn from '../assertions/get-fn';
import { ExternalAssertionLibraryError } from '../errors/test-run';
import Role from '../role/role';
import ROLE_PHASE from '../role/phase';
import { initSelector } from './commands/validations/initializers';
import testRunMarker from './marker-symbol';
import { createReplicator } from '../client-functions/replicator';

import type TestRun from './index';
import type { IsolatedTestController } from '../api/test-controller/isolated';

import ReExecutablePromise from '../utils/re-executable-promise';

import * as path from 'path';
import * as fs from 'fs';

// Wait for page load after navigation
const PAGE_LOAD_TIMEOUT = 30000;

// Fallback when neither the selector nor the run options define a timeout
const DEFAULT_SELECTOR_TIMEOUT = 10000;

// Fallback when neither the assertion options nor the run options define a timeout
const DEFAULT_ASSERTION_TIMEOUT = 3000;

// Poll interval while waiting for an element to appear and become visible
const ELEMENT_WAIT_POLL_INTERVAL = 100;

// Drag step count for smooth drag operations
const DRAG_STEPS = 10;

// Small delay between drag steps (~60fps)
const DRAG_STEP_DELAY = 16;

const SCROLL_POSITIONS = ['topLeft', 'top', 'topRight', 'left', 'center', 'right', 'bottomLeft', 'bottom', 'bottomRight'];

// Resolve options for callers that act on the element as it is right now
const RESOLVE_NOW = { timeout: 0, visibilityCheck: false };

const IS_VISIBLE_FN = `function (el) {
    if (el.nodeType !== 1) return false;
    var rect = el.getBoundingClientRect();
    var s = window.getComputedStyle(el);
    return !(rect.width === 0 && rect.height === 0) && s.display !== 'none' && s.visibility !== 'hidden';
}`;

const SNAPSHOT_FN = `function () {
    var el = this;
    var s = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    var attrs = {};
    if (el.attributes) { for (var i = 0; i < el.attributes.length; i++) { attrs[el.attributes[i].name] = el.attributes[i].value; } }
    var cls = el.className ? el.className.toString().split(/\\s+/).filter(function(c){return c;}) : [];
    var isVis = (${IS_VISIBLE_FN})(el);
    var style = {};
    for (var j = 0; j < s.length; j++) { style[s[j]] = s.getPropertyValue(s[j]); }
    return {
        nodeType: el.nodeType,
        textContent: el.textContent,
        childNodeCount: el.childNodes.length,
        hasChildNodes: el.childNodes.length > 0,
        childElementCount: el.children ? el.children.length : 0,
        hasChildElements: el.children ? el.children.length > 0 : false,
        tagName: el.tagName ? el.tagName.toLowerCase() : null,
        visible: isVis,
        focused: document.activeElement === el,
        attributes: attrs,
        boundingClientRect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height },
        classNames: cls,
        style: style,
        innerText: el.innerText || '',
        namespaceURI: el.namespaceURI || null,
        id: el.id || '',
        value: el.value !== undefined ? el.value : null,
        checked: el.checked !== undefined ? !!el.checked : null,
        selected: el.selected !== undefined ? !!el.selected : null,
        selectedIndex: el.selectedIndex !== undefined ? el.selectedIndex : null,
        scrollWidth: el.scrollWidth || 0,
        scrollHeight: el.scrollHeight || 0,
        scrollLeft: el.scrollLeft || 0,
        scrollTop: el.scrollTop || 0,
        offsetWidth: el.offsetWidth || 0,
        offsetHeight: el.offsetHeight || 0,
        offsetLeft: el.offsetLeft || 0,
        offsetTop: el.offsetTop || 0,
        clientWidth: el.clientWidth || 0,
        clientHeight: el.clientHeight || 0,
        clientLeft: el.clientLeft || 0,
        clientTop: el.clientTop || 0
    };
}`;

// Compiled ClientFunction code calls hammerhead's script-processing instructions, and the isolated tab has no hammerhead
const HAMMERHEAD_INSTRUCTION_SHIMS = `
    var __get$ = function (obj, prop) { return obj[prop]; };
    var __set$ = function (obj, prop, value) { return obj[prop] = value; };
    var __call$ = function (obj, method, args) { return obj[method].apply(obj, args); };
    var __get$Loc = function (location) { return location; };
    var __set$Loc = function () { return false; };
    var __proc$Script = function (script) { return script; };
    var __proc$Html = function (html) { return html; };
    var __get$Eval = function (evalFn) { return evalFn; };
    var __get$PostMessage = function (win, postMessageFn) { return win ? win.postMessage : postMessageFn; };
    var __arrayFrom$ = function (value) { return Array.isArray(value) ? value : Array.from(value); };
    var __rest$Array = function (arr, start) { return Array.prototype.slice.call(arr, start); };
    var __rest$Object = function (obj, excluded) {
        var rest = {};
        Object.keys(obj).forEach(function (key) { if (excluded.indexOf(key) === -1) rest[key] = obj[key]; });
        return rest;
    };
`;

const FRAME_CONTENT_ORIGIN_FN = `function () {
    var rect = this.getBoundingClientRect();
    var s = window.getComputedStyle(this);
    return { x: rect.left + this.clientLeft + parseFloat(s.paddingLeft), y: rect.top + this.clientTop + parseFloat(s.paddingTop) };
}`;

const DISPATCH_EVENT_FN = `function (eventName, options) {
    const opts = Object.assign({}, options, {
        bubbles:    options.bubbles !== false,
        cancelable: options.cancelable !== false,
        detail:     options.detail || { click: 1, dblclick: 2, mousedown: 1, mouseup: 1 }[eventName],
        view:       window,
        buttons:    options.buttons === void 0 ? 1 : options.buttons,
    });
    let ctorName = 'CustomEvent';
    if (/^((mouse\\w+)|((dbl)?click)|(contextmenu))$/.test(eventName) || /^((drag\\w*)|(drop))$/.test(eventName))
        ctorName = 'MouseEvent';
    else if (/^pointer\\w+/.test(eventName))
        ctorName = 'PointerEvent';
    else if (/^key\\w+$/.test(eventName))
        ctorName = 'KeyboardEvent';
    else if (/^(before)?input$/.test(eventName))
        ctorName = 'InputEvent';
    else if (/^(blur|(focus(in|out)?))$/.test(eventName))
        ctorName = 'FocusEvent';
    if (options.eventConstructor && typeof window[options.eventConstructor] === 'function')
        ctorName = options.eventConstructor;
    this.dispatchEvent(new window[ctorName](eventName, opts));
}`;

const FILE_INPUT_CHECK_FN = `function () {
    if (this.tagName !== 'INPUT' || this.type !== 'file')
        throw new Error('Element is not a file input: ' + this.tagName + '[type=' + this.type + ']');
}`;

class CompiledClientFunction {
    public constructor (public readonly fnCode: string, public readonly dependencies: unknown) {}
}

class ClientFunctionTransform {
    public readonly type = 'Function';

    public shouldTransform (): boolean {
        return false;
    }

    public toSerializable (): void {
        return void 0;
    }

    public fromSerializable (value: { fnCode: string; dependencies: unknown }): object {
        return new CompiledClientFunction(value.fnCode, value.dependencies);
    }
}

function toClientJs (value: any): string {
    if (value === void 0)
        return 'void 0';

    if (typeof value === 'number')
        return Object.is(value, -0) ? '-0' : String(value);

    if (value === null || typeof value === 'string' || typeof value === 'boolean')
        return JSON.stringify(value);

    if (value instanceof CompiledClientFunction)
        return `(function() { var __dependencies$ = ${toClientJs(value.dependencies)}; return ${value.fnCode.replace(/;\s*$/, '')}; })()`;

    if (value instanceof Date)
        return `new Date(${value.getTime()})`;

    if (value instanceof RegExp)
        return `new RegExp(${JSON.stringify(value.source)}, ${JSON.stringify(value.flags)})`;

    if (Array.isArray(value))
        return `[${value.map(toClientJs).join(', ')}]`;

    const proto = typeof value === 'object' ? Object.getPrototypeOf(value) : void 0;

    if (proto === Object.prototype || proto === null)
        return `{${Object.keys(value).map(key => `${JSON.stringify(key)}: ${toClientJs(value[key])}`).join(', ')}}`;

    throw new Error(`Isolated session: cannot pass ${Object.prototype.toString.call(value)} to the isolated tab. Use primitives, arrays, plain objects, dates, regular expressions or functions.`);
}

export interface ResolvedElement {
    objectId: string;
    contextId: number | undefined;
    description: string;
}

/**
 * IsolatedSession manages a fully isolated Chrome browser context created via CDP's
 * Target.createBrowserContext(). Each session gets separate cookies, localStorage,
 * sessionStorage, and service workers. All commands (click, type, scroll, etc.) execute
 * directly via CDP without TestCafe's client-side driver injection.
 *
 * Created via t.openIsolatedSession() in test code. Automatically disposed when the
 * parent test run ends.
 */
export class IsolatedSession extends AsyncEventEmitter {
    public readonly id: string;
    public readonly parentTestRun: TestRun;
    public readonly nativeAutomation: NativeAutomationIsolatedWindow;
    public readonly browserContextId: string;

    private _disposed: boolean;
    private _cdpClient: ProtocolApi;

    // Execution context ID for iframe support (undefined = main frame)
    private _currentContextId: number | undefined;

    // Main-world execution context of every frame, by frameId
    private readonly _frameContexts: Map<string, number>;

    private _frameElements: ResolvedElement[];

    private _unexpectedDialog: { type: string; message: string; url: string } | null;

    // Configurable page load timeout (default: PAGE_LOAD_TIMEOUT constant)
    private _pageLoadTimeout: number;

    // Role storages ({ localStorage, sessionStorage } snapshot strings) waiting to be
    // applied on the next navigation — storage APIs need a real page origin
    private _pendingRoleStorages: { localStorage?: string; sessionStorage?: string } | null;

    public controller: IsolatedTestController | null;

    public constructor ({ parentTestRun, nativeAutomation, browserContextId }: {
        parentTestRun: TestRun;
        nativeAutomation: NativeAutomationIsolatedWindow;
        browserContextId: string;
    }) {
        super();

        this.id                = `isolated-${nanoid()}`;
        this.parentTestRun     = parentTestRun;
        this.nativeAutomation  = nativeAutomation;
        this.browserContextId  = browserContextId;
        this.controller        = null;
        this._disposed         = false;
        this._currentContextId = void 0;
        this._pageLoadTimeout  = PAGE_LOAD_TIMEOUT;

        this._pendingRoleStorages = null;

        // The CDP client for the isolated tab
        this._cdpClient = nativeAutomation.cdpClient;

        this._frameContexts     = new Map();
        this._frameElements     = [];
        this._unexpectedDialog  = null;

        // Lets ClientFunction / Selector .with({ boundTestRun: t2 }) accept the isolated session
        (this as any)[testRunMarker] = true;

        this._trackFrameContexts();
        this._handleNativeDialogs();
        IsolatedSession._installSelectorRouter(parentTestRun);
    }

    // TestRun.opts is private — the isolated session intentionally reads the run
    // options (selectorTimeout, assertionTimeout, screenshots) at runtime
    private get _runOpts (): any {
        return (this.parentTestRun as any).opts || {};
    }

    /**
     * Execute a TestCafe command directly via CDP. Dispatches to the appropriate
     * CDP method based on command type (click → Input.dispatchMouseEvent,
     * typeText → Input.insertText, navigateTo → Page.navigate, etc.).
     */
    public async executeCommand (command: CommandBase | ActionCommandBase, callsite?: CallsiteRecord | string): Promise<unknown> {
        if (this._disposed)
            throw new Error('Isolated session has been disposed');

        if (command.type === COMMAND_TYPE.wait)
            return delay((command as any).timeout);

        if (command.type === COMMAND_TYPE.navigateTo)
            return this._navigateTo((command as any).url);

        if (command.type === COMMAND_TYPE.getCookies)
            return this._getCookies((command as any).cookies, (command as any).urls);

        if (command.type === COMMAND_TYPE.setCookies) {
            const cookiesVal = (command as any).cookies;
            const url        = (command as any).url || '';

            return this._setCookies(cookiesVal, url);
        }

        if (command.type === COMMAND_TYPE.deleteCookies)
            return this._deleteCookies((command as any).cookies, (command as any).urls);

        if (command.type === COMMAND_TYPE.useRole)
            return this._useRole((command as any).role as Role);

        if (command.type === COMMAND_TYPE.executeExpression)
            return this.evaluateExpression((command as any).expression);

        // --- Mouse interactions ---

        if (command.type === COMMAND_TYPE.click)
            return this._cdpClick(command);

        if (command.type === COMMAND_TYPE.rightClick)
            return this._cdpClick(command, 'right');

        if (command.type === COMMAND_TYPE.doubleClick)
            return this._cdpClick(command, 'left', 2);

        if (command.type === COMMAND_TYPE.hover)
            return this._cdpHover(command);

        if (command.type === COMMAND_TYPE.drag)
            return this._cdpDrag(command);

        if (command.type === COMMAND_TYPE.dragToElement)
            return this._cdpDragToElement(command);

        // --- Keyboard ---

        if (command.type === COMMAND_TYPE.typeText)
            return this._cdpTypeText(command);

        if (command.type === COMMAND_TYPE.pressKey)
            return this._cdpPressKey(command);

        if (command.type === COMMAND_TYPE.selectText)
            return this._cdpSelectText(command);

        // --- Scroll ---

        if (command.type === COMMAND_TYPE.scroll)
            return this._cdpScroll(command);

        if (command.type === COMMAND_TYPE.scrollBy)
            return this._cdpScrollBy(command);

        if (command.type === COMMAND_TYPE.scrollIntoView)
            return this._cdpScrollIntoView(command);

        // --- Events ---

        if (command.type === COMMAND_TYPE.dispatchEvent)
            return this._cdpDispatchEvent(command);

        // --- Assertions ---

        if (command.type === COMMAND_TYPE.assertion)
            return this._executeAssertion(command as any, callsite);

        // --- Selector-based commands ---

        if (command.type === COMMAND_TYPE.executeSelector)
            return this._executeSelectorViaCDP(command as any);

        if (command.type === COMMAND_TYPE.executeClientFunction)
            return this._executeClientFunctionViaCDP(command as any);

        throw new Error(
            `Command '${command.type}' is not supported in isolated sessions. ` +
            'Supported: click, rightClick, doubleClick, hover, drag, dragToElement, ' +
            'typeText, pressKey, selectText, scroll, scrollBy, scrollIntoView, ' +
            'dispatchEvent, navigateTo, wait, eval, expect, useRole, ' +
            'getCookies, setCookies, deleteCookies, takeScreenshot, takeElementScreenshot, ' +
            'setFilesToUpload, clearUpload, setPageLoadTimeout, ' +
            'maximizeWindow, resizeWindow, switchToIframe, switchToMainWindow, ' +
            'executeSelector, executeClientFunction.'
        );
    }

    // =====================================================================
    // Assertion handling (with ReExecutablePromise support)
    // =====================================================================

    private static readonly _ASSERTION_RETRY_DELAY = 200;

    // Selectors and ClientFunctions (e.g. sel.visible in an assertion or inside t2.run)
    // execute through testRun.executeCommand, which targets the MAIN tab. One permanent
    // router per test run consults a stack of sessions that currently own selector
    // execution and redirects selector / ClientFunction commands to the innermost one.
    private static _installSelectorRouter (testRun: any): void {
        if (testRun._isolatedSelectorTargets)
            return;

        testRun._isolatedSelectorTargets = [];

        const originalExecuteCommand = testRun.executeCommand.bind(testRun);

        testRun.executeCommand = async (cmd: any, cmdCallsite?: any) => {
            const sessions = testRun._isolatedSelectorTargets;
            const active   = sessions.length ? sessions[sessions.length - 1] : null;

            if (active && cmd.type === COMMAND_TYPE.executeSelector)
                return active._executeSelectorViaCDP(cmd);

            if (active && cmd.type === COMMAND_TYPE.executeClientFunction)
                return active._executeClientFunctionViaCDP(cmd);

            return originalExecuteCommand(cmd, cmdCallsite);
        };
    }

    /** Route selectors and ClientFunctions to this session while fn runs. */
    public async withSelectorRouting<T> (fn: () => Promise<T>): Promise<T> {
        const sessions = (this.parentTestRun as any)._isolatedSelectorTargets;

        sessions.push(this);

        try {
            return await fn();
        }
        finally {
            sessions.splice(sessions.lastIndexOf(this), 1);
        }
    }

    private async _executeAssertion (command: any, callsite?: CallsiteRecord | string): Promise<void> {
        const reExecutable = command.actual instanceof ReExecutablePromise ? command.actual : null;
        const timeout      = command.options?.timeout ?? this._runOpts.assertionTimeout ?? DEFAULT_ASSERTION_TIMEOUT;
        const startTime    = Date.now();

        const sessions     = (this.parentTestRun as any)._isolatedSelectorTargets;

        if (reExecutable)
            sessions.push(this);

        try {
            while (true) {
                // Re-resolve the ReExecutablePromise on each iteration
                if (reExecutable) {
                    try {
                        command.actual = await reExecutable._reExecute();
                    }
                    catch (err: any) {
                        // Selector threw (e.g. element not found) — retry if time remains
                        if (Date.now() - startTime >= timeout) {
                            err.callsite = callsite;

                            throw err;
                        }

                        await delay(IsolatedSession._ASSERTION_RETRY_DELAY);
                        continue;
                    }
                }

                const fn = getFn(command);

                try {
                    fn();

                    return; // Assertion passed
                }
                catch (err: any) {
                    if (!reExecutable || Date.now() - startTime >= timeout) {
                        if (err.name === 'AssertionError' || err.constructor?.name === 'AssertionError')
                            throw new ExternalAssertionLibraryError(err, callsite as CallsiteRecord);

                        throw err;
                    }

                    await delay(IsolatedSession._ASSERTION_RETRY_DELAY);
                }
            }
        }
        finally {
            if (reExecutable)
                sessions.splice(sessions.lastIndexOf(this), 1);
        }
    }

    // =====================================================================
    // Selector execution via CDP
    // =====================================================================

    // Execute a selector command directly in the isolated tab via CDP.
    // Returns a number (counter mode) or a plain snapshot object (snapshot mode).
    // Like the driver, counter mode answers at once and snapshot mode waits up to the selector timeout.
    public async _executeSelectorViaCDP (command: any): Promise<unknown> {
        // Wrap in array: the replicator's decode() expects encode()-format
        // (encode wraps values in [value], decode returns references[0])
        if (command.counterMode)
            return [await this.evaluateExpression(`${this._compileNodesExpression(command)}.length`)];

        const timeout = command.timeout ?? this._runOpts.selectorTimeout ?? DEFAULT_SELECTOR_TIMEOUT;
        const found   = await this._findElement(command, timeout, command.visibilityCheck);

        if (found.objectId)
            return [await this.callOnElement(found as ResolvedElement, SNAPSHOT_FN)];

        // getVisibleValueMode: return null without error when element not found
        if (command.needError && !command.getVisibleValueMode)
            throw new Error(found.error);

        return [null];
    }

    /**
     * Resolve a CSS string, Selector, node snapshot or selector command to a remote object
     * in the current frame. Waits up to the selector timeout for the element to appear (and,
     * with visibilityCheck, to become visible), then throws.
     */
    public async resolveElement (selector: any, options: { timeout?: number; visibilityCheck?: boolean } = {}): Promise<ResolvedElement> {
        const command: any    = initSelector('selector', selector, { testRun: this.parentTestRun });
        const timeout         = options.timeout ?? command.timeout ?? this._runOpts.selectorTimeout ?? DEFAULT_SELECTOR_TIMEOUT;
        const visibilityCheck = options.visibilityCheck ?? command.visibilityCheck;
        const found           = await this._findElement(command, timeout, visibilityCheck);

        if (!found.objectId)
            throw new Error(found.error);

        return found as ResolvedElement;
    }

    /** Call a function with the element as `this` and return its result by value. */
    public async callOnElement (element: ResolvedElement, functionDeclaration: string, args: unknown[] = []): Promise<any> {
        const result = await this._cdpClient.Runtime.callFunctionOn({
            objectId:      element.objectId,
            functionDeclaration,
            arguments:     args.map(value => ({ value })),
            returnByValue: true,
            awaitPromise:  true,
        });

        this._throwOnException(result.exceptionDetails);

        return result.result.value;
    }

    private async _findElement (command: any, timeout: number, visibilityCheck: boolean): Promise<Partial<ResolvedElement> & { error: string }> {
        const description = this._describeSelector(command);
        const expression  = `(function() {
            var el = ${this._compileNodesExpression(command)}[0];
            if (!el) return null;
            return ${!!visibilityCheck} && !(${IS_VISIBLE_FN})(el) ? 'invisible' : el;
        })()`;

        const startTime = Date.now();

        while (true) {
            const contextId = this._currentContextId;
            const result    = await this._cdpClient.Runtime.evaluate({ expression, ...this._contextIdParam() });

            this._throwOnException(result.exceptionDetails);

            if (result.result.objectId)
                return { objectId: result.result.objectId, contextId, description, error: '' };

            if (Date.now() - startTime >= timeout) {
                const reason = result.result.value === 'invisible' ? 'did not become visible' : 'was not found';

                return { description, error: `Isolated session: the element ${reason} within ${timeout}ms: ${description}` };
            }

            await delay(ELEMENT_WAIT_POLL_INTERVAL);
        }
    }

    // A selector head is "Selector('<css>')" with the CSS inserted verbatim (quotes unescaped).
    // Returns null when the entry is not a plain CSS-string selector.
    private _extractBaseCss (chainEntry: string): string | null {
        const cssMatch = chainEntry.match(/^Selector\('([\s\S]*)'\)$/);

        return cssMatch ? cssMatch[1] : null;
    }

    // Parse an apiFnChain into its base CSS and compiled chain-step JS statements
    private _compileChain (selector: any): { baseCss: string; steps: string[] } {
        const chain      = selector.apiFnChain;
        const chainEntry = chain[0];
        const baseCss    = this._extractBaseCss(chainEntry);

        if (baseCss === null) {
            if (chainEntry.includes('[function]'))
                throw new Error(`Isolated sessions only support CSS string selectors. Function-form selector not supported: ${chainEntry}`);

            throw new Error(`Isolated sessions only support CSS string selectors. Cannot parse selector: ${chainEntry}`);
        }

        const steps: string[] = [];

        for (let i = 1; i < chain.length; i++) {
            // .with() options already sit on the command (timeout, visibilityCheck)
            if (chain[i].startsWith('.with('))
                continue;

            const parsed = this._parseChainMethod(chain[i]);

            steps.push(this._chainStepToJS(parsed));
        }

        return { baseCss, steps };
    }

    // Compile a selector's apiFnChain into a JS expression that evaluates to the matching nodes
    private _compileNodesExpression (selector: any): string {
        const { baseCss, steps } = this._compileChain(selector);

        return `(function() { var nodes = Array.from(document.querySelectorAll(${JSON.stringify(baseCss)})); ${steps.join(' ')} return nodes; })()`;
    }

    // =====================================================================
    // ClientFunction execution via CDP
    // =====================================================================

    public async _executeClientFunctionViaCDP (command: any): Promise<unknown> {
        const fnCode = command.fnCode;

        if (!fnCode)
            throw new Error('Isolated session: ClientFunction command has no fnCode');

        // decode() rewrites its input in place, and a retrying assertion re-runs the same command
        const replicator   = createReplicator([new ClientFunctionTransform()]);
        const decode       = (encoded: unknown): string => toClientJs(replicator.decode(JSON.parse(JSON.stringify(encoded))));
        const args         = decode(command.args);
        const dependencies = decode(command.dependencies);

        const expression = `(function() { ${HAMMERHEAD_INSTRUCTION_SHIMS} var __dependencies$ = ${dependencies}; var __f$ = ${fnCode}; return __f$.apply(window, ${args}); })()`;

        // Wrap in array: the replicator's decode() expects encode()-format
        const result = await this.evaluateExpression(expression);

        return [result];
    }

    // =====================================================================
    // Navigation
    // =====================================================================

    private async _navigateTo (url: string): Promise<void> {
        // Navigation destroys iframe execution contexts — a stale contextId would
        // make every subsequent eval fail until the page-load poll times out.
        this._currentContextId = void 0;
        this._frameElements    = [];

        const { errorText } = await this._cdpClient.Page.navigate({ url });

        if (errorText)
            throw new Error(`Isolated session: failed to navigate to ${url}: ${errorText}`);

        await this._waitForPageLoad();
        await this._applyPendingRoleStorages();
    }

    private async _waitForPageLoad (): Promise<void> {
        const startTime = Date.now();
        const timeout   = this._pageLoadTimeout;

        while (Date.now() - startTime < timeout) {
            try {
                const result = await this._cdpClient.Runtime.evaluate({
                    expression:    'document.readyState',
                    returnByValue: true,
                    ...this._contextIdParam(),
                });

                if (result.result.value === 'complete')
                    return;
            }
            catch (e) {
                // Page might be mid-navigation (context destroyed) — retry
            }

            await delay(100);
        }

        throw new Error(`Isolated session: page did not reach readyState 'complete' within ${timeout}ms`);
    }

    // =====================================================================
    // Expression evaluation
    // =====================================================================

    /** Evaluate a JavaScript expression in the isolated tab via CDP Runtime.evaluate. */
    public async evaluateExpression (expression: string): Promise<unknown> {
        const result = await this._cdpClient.Runtime.evaluate({
            expression,
            returnByValue: true,
            awaitPromise:  true,
            ...this._contextIdParam(),
        });

        this._throwOnException(result.exceptionDetails);

        return result.result.value;
    }

    private _throwOnException (exceptionDetails: any): void {
        if (!exceptionDetails)
            return;

        const errText = exceptionDetails.exception?.description
            || exceptionDetails.text
            || 'Expression evaluation failed';

        throw new Error(`Isolated session eval error: ${errText}`);
    }

    // Returns contextId param for Runtime.evaluate when inside an iframe
    private _contextIdParam (): { contextId?: number } {
        return this._currentContextId !== void 0 ? { contextId: this._currentContextId } : {};
    }

    // =====================================================================
    // Mouse interactions
    // =====================================================================

    // Convert TestCafe action modifiers ({ ctrl, alt, shift, meta }) to a CDP bitmask
    private _getModifiersBitmask (options: any): number {
        if (!options)
            return 0;

        return (options.alt ? 1 : 0) | (options.ctrl ? 2 : 0) | (options.meta ? 4 : 0) | (options.shift ? 8 : 0);
    }

    // TestCafe offsets are relative to the element's top-left corner;
    // negative values count from the right/bottom edge
    private _offsetExpr (offset: number | undefined, sizeExpr: string): string {
        if (typeof offset !== 'number')
            return `${sizeExpr} / 2`;

        return offset >= 0 ? String(offset) : `${sizeExpr} + (${offset})`;
    }

    // Wait until the element exists and is visible, then return the target point.
    // Mirrors TestCafe's action auto-wait: poll until the selector timeout elapses.
    private async _waitForElementPoint (selector: any, options: any): Promise<{ x: number; y: number }> {
        const element = await this.resolveElement(selector, { visibilityCheck: true });
        const xExpr   = this._offsetExpr(options?.offsetX, 'rect.width');
        const yExpr   = this._offsetExpr(options?.offsetY, 'rect.height');

        const point = await this.callOnElement(element, `function () {
            this.scrollIntoView({ block: 'center', inline: 'center' });
            const rect = this.getBoundingClientRect();
            return { x: rect.x + (${xExpr}), y: rect.y + (${yExpr}) };
        }`);

        return this._toTopViewport(point);
    }

    private async _toTopViewport<T extends { x: number; y: number }> (point: T): Promise<T> {
        for (const frame of this._frameElements) {
            const origin = await this.callOnElement(frame, FRAME_CONTENT_ORIGIN_FN);

            point.x += origin.x;
            point.y += origin.y;
        }

        return point;
    }

    private async _getElementPoint (command: any): Promise<{ x: number; y: number }> {
        return this._waitForElementPoint(command.selector, command.options);
    }

    private _describeSelector (selector: any): string {
        return selector.apiFnChain.join('');
    }

    private async _setCaret (selector: any, caretPos: number | null): Promise<void> {
        const element = await this.resolveElement(selector, RESOLVE_NOW);

        await this.callOnElement(element, `function (caretPos) {
            if (typeof this.setSelectionRange === 'function' && typeof this.value === 'string') {
                const pos = caretPos === null ? this.value.length : caretPos;
                try {
                    this.setSelectionRange(pos, pos);
                }
                catch (e) {}
            }
            else if (this.isContentEditable && caretPos === null) {
                const selection = window.getSelection();
                selection.selectAllChildren(this);
                selection.collapseToEnd();
            }
        }`, [caretPos]);
    }

    // Click an element via CDP input dispatch
    private async _cdpClick (command: any, button: 'left' | 'right' = 'left', clickCount = 1): Promise<void> {
        const coords    = await this._getElementPoint(command);
        const modifiers = this._getModifiersBitmask(command.options?.modifiers);

        // mouseMoved before press so hover/mouseenter handlers fire, as a real click would
        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseMoved', x: coords.x, y: coords.y, modifiers,
        });

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mousePressed', x: coords.x, y: coords.y, button, clickCount, modifiers,
        });

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseReleased', x: coords.x, y: coords.y, button, clickCount, modifiers,
        });

        if (typeof command.options?.caretPos === 'number')
            await this._setCaret(command.selector, command.options.caretPos);
    }

    // Hover over an element (mouseMoved without press)
    private async _cdpHover (command: any): Promise<void> {
        const coords    = await this._getElementPoint(command);
        const modifiers = this._getModifiersBitmask(command.options?.modifiers);

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseMoved', x: coords.x, y: coords.y, modifiers,
        });
    }

    // Drag an element by pixel offset
    private async _cdpDrag (command: any): Promise<void> {
        const start = await this._getElementPoint(command);
        const endX  = start.x + ((command as any).dragOffsetX || 0);
        const endY  = start.y + ((command as any).dragOffsetY || 0);

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseMoved', x: start.x, y: start.y,
        });

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mousePressed', x: start.x, y: start.y, button: 'left', clickCount: 1,
        });

        // Move in steps for smooth drag (frameworks often need intermediate events)
        for (let i = 1; i <= DRAG_STEPS; i++) {
            const p = i / DRAG_STEPS;

            await this._cdpClient.Input.dispatchMouseEvent({
                type: 'mouseMoved',
                x:    start.x + (endX - start.x) * p,
                y:    start.y + (endY - start.y) * p,
            });

            await delay(DRAG_STEP_DELAY);
        }

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseReleased', x: endX, y: endY, button: 'left', clickCount: 1,
        });
    }

    // Drag from one element to another
    private async _cdpDragToElement (command: any): Promise<void> {
        const start = await this._getElementPoint(command);

        const end = await this._waitForElementPoint(
            (command as any).destinationSelector,
            { offsetX: (command as any).options?.destinationOffsetX, offsetY: (command as any).options?.destinationOffsetY }
        );

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseMoved', x: start.x, y: start.y,
        });

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mousePressed', x: start.x, y: start.y, button: 'left', clickCount: 1,
        });

        for (let i = 1; i <= DRAG_STEPS; i++) {
            const p = i / DRAG_STEPS;

            await this._cdpClient.Input.dispatchMouseEvent({
                type: 'mouseMoved',
                x:    start.x + (end.x - start.x) * p,
                y:    start.y + (end.y - start.y) * p,
            });

            await delay(DRAG_STEP_DELAY);
        }

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseReleased', x: end.x, y: end.y, button: 'left', clickCount: 1,
        });
    }

    // =====================================================================
    // Keyboard interactions
    // =====================================================================

    // Type text via CDP input dispatch
    private async _cdpTypeText (command: any): Promise<void> {
        const text = command.text as string;

        await this._cdpClick(command);

        if (!command.options?.replace && typeof command.options?.caretPos !== 'number')
            await this._setCaret(command.selector, null);

        if (command.options?.replace) {
            const element = await this.resolveElement(command.selector, RESOLVE_NOW);

            await this.callOnElement(element, `function () {
                const el = this;
                if (typeof el.select === 'function')
                    el.select();
                else if (typeof el.setSelectionRange === 'function')
                    el.setSelectionRange(0, el.value.length);
                else
                    document.execCommand('selectAll');
            }`);
        }

        await this._cdpClient.Input.insertText({ text });
    }

    // Press key combo via CDP — supports modifiers (e.g. 'ctrl+a', 'shift+Tab')
    private async _cdpPressKey (command: any): Promise<void> {
        const keyString = command.keys as string;
        // Support space-separated combos like "ctrl+a ctrl+c"
        const combos = keyString.split(/\s+/);

        const MODIFIER_MAP: Record<string, { key: string; code: string; keyCode: number; flag: number }> = {
            'alt':     { key: 'Alt', code: 'AltLeft', keyCode: 18, flag: 1 },
            'ctrl':    { key: 'Control', code: 'ControlLeft', keyCode: 17, flag: 2 },
            'control': { key: 'Control', code: 'ControlLeft', keyCode: 17, flag: 2 },
            'meta':    { key: 'Meta', code: 'MetaLeft', keyCode: 91, flag: 4 },
            'command': { key: 'Meta', code: 'MetaLeft', keyCode: 91, flag: 4 },
            'shift':   { key: 'Shift', code: 'ShiftLeft', keyCode: 16, flag: 8 },
        };

        const SHORTCUT_COMMANDS: Record<string, string[]> = {
            'ctrl+a': ['selectAll'],
            'ctrl+c': ['copy'],
            'ctrl+v': ['paste'],
            'ctrl+x': ['cut'],
            'ctrl+z': ['undo'],
            'ctrl+y': ['redo'],
        };

        // Canonical DOM key values — event.key must be 'Enter', not 'enter', or
        // application key handlers won't match. text triggers the browser's default
        // behavior for printable keys and Enter (newline insertion, form submission).
        const KEY_CODE_MAP: Record<string, { key: string; code: string; keyCode: number; text?: string }> = {
            'enter':      { key: 'Enter', code: 'Enter', keyCode: 13, text: '\r' },
            'tab':        { key: 'Tab', code: 'Tab', keyCode: 9 },
            'esc':        { key: 'Escape', code: 'Escape', keyCode: 27 },
            'escape':     { key: 'Escape', code: 'Escape', keyCode: 27 },
            'backspace':  { key: 'Backspace', code: 'Backspace', keyCode: 8 },
            'delete':     { key: 'Delete', code: 'Delete', keyCode: 46 },
            'space':      { key: ' ', code: 'Space', keyCode: 32, text: ' ' },
            'up':         { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
            'down':       { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
            'left':       { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
            'right':      { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
            'arrowup':    { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
            'arrowdown':  { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
            'arrowleft':  { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
            'arrowright': { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
            'home':       { key: 'Home', code: 'Home', keyCode: 36 },
            'end':        { key: 'End', code: 'End', keyCode: 35 },
            'pageup':     { key: 'PageUp', code: 'PageUp', keyCode: 33 },
            'pagedown':   { key: 'PageDown', code: 'PageDown', keyCode: 34 },
            'ins':        { key: 'Insert', code: 'Insert', keyCode: 45 },
            'capslock':   { key: 'CapsLock', code: 'CapsLock', keyCode: 20 },
            'f1':         { key: 'F1', code: 'F1', keyCode: 112 },
            'f2':         { key: 'F2', code: 'F2', keyCode: 113 },
            'f3':         { key: 'F3', code: 'F3', keyCode: 114 },
            'f4':         { key: 'F4', code: 'F4', keyCode: 115 },
            'f5':         { key: 'F5', code: 'F5', keyCode: 116 },
            'f6':         { key: 'F6', code: 'F6', keyCode: 117 },
            'f7':         { key: 'F7', code: 'F7', keyCode: 118 },
            'f8':         { key: 'F8', code: 'F8', keyCode: 119 },
            'f9':         { key: 'F9', code: 'F9', keyCode: 120 },
            'f10':        { key: 'F10', code: 'F10', keyCode: 121 },
            'f11':        { key: 'F11', code: 'F11', keyCode: 122 },
            'f12':        { key: 'F12', code: 'F12', keyCode: 123 },
        };

        for (const combo of combos) {
            const keys = combo.split('+').map((k: string) => k.trim());

            const modifiers: Array<{ key: string; code: string; keyCode: number; flag: number }> = [];
            const regularKeys: string[] = [];
            let modifiersBitmask = 0;

            for (const key of keys) {
                const mod = MODIFIER_MAP[key.toLowerCase()];

                if (mod) {
                    modifiers.push(mod);
                    modifiersBitmask |= mod.flag;
                }
                else
                    regularKeys.push(key);
            }

            const comboLower  = combo.toLowerCase();
            const cmdCommands = SHORTCUT_COMMANDS[comboLower] || [];

            for (const mod of modifiers) {
                await this._cdpClient.Input.dispatchKeyEvent({
                    type:                  'rawKeyDown',
                    key:                   mod.key,
                    code:                  mod.code,
                    windowsVirtualKeyCode: mod.keyCode,
                    nativeVirtualKeyCode:  mod.keyCode,
                    modifiers:             modifiersBitmask,
                });
            }

            for (const key of regularKeys) {
                const keyLower = key.toLowerCase();
                const keyInfo  = KEY_CODE_MAP[keyLower];

                // Fabricating key/code/keyCode for an unknown named key would dispatch a
                // plausible-looking but wrong event — fail loudly instead
                if (!keyInfo && key.length > 1) {
                    throw new Error(
                        `Isolated session: unsupported key '${key}' in pressKey. ` +
                        `Supported named keys: ${Object.keys(KEY_CODE_MAP).join(', ')}.`
                    );
                }

                const hasNonShiftModifiers = (modifiersBitmask & ~8) !== 0;
                const hasShift             = (modifiersBitmask & 8) !== 0;
                const isLetter             = /^[a-z]$/i.test(key);
                const isDigit              = /^[0-9]$/.test(key);

                // Shift changes which character a non-letter key produces ('shift+1' → '!'),
                // which depends on the keyboard layout — require the shifted character directly
                if (hasShift && key.length === 1 && !isLetter)
                    throw new Error(`Isolated session: pressKey('shift+${key}') is not supported — press the shifted character directly, e.g. pressKey('!').`);

                const shiftedKey = hasShift && isLetter ? key.toUpperCase() : key;
                const keyValue   = keyInfo ? keyInfo.key : shiftedKey;

                let code: string;

                if (keyInfo)
                    code = keyInfo.code;
                else if (isDigit)
                    code = `Digit${key}`;
                else if (isLetter)
                    code = `Key${key.toUpperCase()}`;
                else
                    code = '';

                const keyCode = keyInfo ? keyInfo.keyCode : key.toUpperCase().charCodeAt(0);

                // text makes the browser run default key behavior (character insertion,
                // Enter submitting a form). Suppressed when a non-shift modifier is held —
                // ctrl+a must not type an 'a'.
                let text: string | undefined = keyInfo ? keyInfo.text : shiftedKey;

                if (hasNonShiftModifiers)
                    text = void 0;

                await this._cdpClient.Input.dispatchKeyEvent({
                    type:                  text ? 'keyDown' : 'rawKeyDown',
                    key:                   keyValue,
                    code,
                    text,
                    windowsVirtualKeyCode: keyCode,
                    nativeVirtualKeyCode:  keyCode,
                    modifiers:             modifiersBitmask,
                    commands:              cmdCommands,
                } as any);

                await this._cdpClient.Input.dispatchKeyEvent({
                    type:                  'keyUp',
                    key:                   keyValue,
                    code,
                    windowsVirtualKeyCode: keyCode,
                    nativeVirtualKeyCode:  keyCode,
                    modifiers:             modifiersBitmask,
                });
            }

            // Release modifiers (reverse order)
            for (const mod of [...modifiers].reverse()) {
                await this._cdpClient.Input.dispatchKeyEvent({
                    type:                  'keyUp',
                    key:                   mod.key,
                    code:                  mod.code,
                    windowsVirtualKeyCode: mod.keyCode,
                    nativeVirtualKeyCode:  mod.keyCode,
                });
            }
        }
    }

    // Select text in an input/textarea or content-editable element
    private async _cdpSelectText (command: any): Promise<void> {
        const element = await this.resolveElement(command.selector);

        await this.callOnElement(element, `function (startPos, endPos) {
            const el = this;
            el.focus();
            if (typeof el.setSelectionRange === 'function') {
                const end = endPos === null ? el.value.length : endPos;
                if (startPos > end)
                    el.setSelectionRange(end, startPos, 'backward');
                else
                    el.setSelectionRange(startPos, end);
                return;
            }
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            const points = [];
            let offset = 0;
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                points.push({ node: node, start: offset });
                offset += node.data.length;
            }
            const end = endPos === null ? offset : Math.min(endPos, offset);
            const toPoint = function (pos) {
                for (let i = points.length - 1; i >= 0; i--) {
                    if (points[i].start <= pos)
                        return [points[i].node, pos - points[i].start];
                }
                return [el, 0];
            };
            const anchor = toPoint(Math.min(startPos, offset));
            const focus  = toPoint(end);
            window.getSelection().setBaseAndExtent(anchor[0], anchor[1], focus[0], focus[1]);
        }`, [command.startPos ?? 0, command.endPos ?? null]);
    }

    // =====================================================================
    // Scroll
    // =====================================================================

    private async _cdpScroll (command: any): Promise<void> {
        const { x, y, position } = command;

        if (position && !SCROLL_POSITIONS.includes(position))
            throw new Error(`Isolated session: unknown scroll position '${position}'. Use one of: ${SCROLL_POSITIONS.join(', ')}.`);

        await this._setScroll(command.selector, { x, y, position });
    }

    private async _cdpScrollBy (command: any): Promise<void> {
        await this._setScroll(command.selector, { byX: command.byX, byY: command.byY });
    }

    private async _setScroll (selector: any, scroll: { x?: number | null; y?: number | null; position?: string; byX?: number; byY?: number }): Promise<void> {
        const element = selector
            ? await this.resolveElement(selector)
            : await this._resolveScrollingElement();

        await this.callOnElement(element, `function (s) {
            const el = this;
            let x = s.x;
            let y = s.y;
            if (s.position) {
                const centerX = Math.floor(el.scrollWidth / 2 - el.clientWidth / 2);
                const centerY = Math.floor(el.scrollHeight / 2 - el.clientHeight / 2);
                const positions = {
                    top:         [centerX, 0],
                    right:       [el.scrollWidth, centerY],
                    bottom:      [centerX, el.scrollHeight],
                    left:        [0, centerY],
                    topRight:    [el.scrollWidth, 0],
                    topLeft:     [0, 0],
                    bottomRight: [el.scrollWidth, el.scrollHeight],
                    bottomLeft:  [0, el.scrollHeight],
                    center:      [centerX, centerY],
                };
                x = positions[s.position][0];
                y = positions[s.position][1];
            }
            let left = typeof x === 'number' ? x : el.scrollLeft;
            let top  = typeof y === 'number' ? y : el.scrollTop;
            if (s.byX)
                left += s.byX;
            if (s.byY)
                top += s.byY;
            el.scrollLeft = left;
            el.scrollTop  = top;
        }`, [scroll]);
    }

    private async _resolveScrollingElement (): Promise<ResolvedElement> {
        const contextId = this._currentContextId;
        const result    = await this._cdpClient.Runtime.evaluate({
            expression: 'document.scrollingElement || document.documentElement',
            ...this._contextIdParam(),
        });

        this._throwOnException(result.exceptionDetails);

        return { objectId: result.result.objectId as string, contextId, description: 'document' };
    }

    private async _cdpScrollIntoView (command: any): Promise<void> {
        const element = await this.resolveElement(command.selector);

        await this.callOnElement(element, `function () {
            this.scrollIntoView({ block: 'center', inline: 'center' });
        }`);
    }

    // =====================================================================
    // Events
    // =====================================================================

    private async _cdpDispatchEvent (command: any): Promise<void> {
        const element      = await this.resolveElement(command.selector);
        const eventName    = (command as any).eventName;
        const eventOptions = (command as any).options || {};

        await this.callOnElement(element, DISPATCH_EVENT_FN, [eventName, eventOptions]);
    }

    // =====================================================================
    // Screenshots
    // =====================================================================

    // Resolve where to write a screenshot: explicit absolute path wins; relative paths
    // and generated names go under the run's screenshots dir (or ./artifacts/screenshots)
    private _resolveScreenshotPath (filePath: string | undefined, generatedPrefix: string): string {
        const baseDir = this._runOpts.screenshots?.path || path.join(process.cwd(), 'artifacts', 'screenshots');

        if (!filePath)
            return path.join(baseDir, `${generatedPrefix}-${Date.now()}.png`);

        return path.isAbsolute(filePath) ? filePath : path.join(baseDir, filePath);
    }

    /** Capture a PNG screenshot of the viewport, or of the whole page with { fullPage: true }. Returns the file path. */
    public async takeScreenshot (options?: string | { path?: string; fullPage?: boolean }): Promise<string> {
        const { path: filePath, fullPage } = typeof options === 'object' && options !== null ? options : { path: options, fullPage: false };

        // Ensure Page domain is enabled (isolated windows don't call start())
        await (this._cdpClient as any).Page.enable();

        let clip: object | undefined;

        if (fullPage) {
            const { cssContentSize } = await (this._cdpClient as any).Page.getLayoutMetrics();

            clip = { x: 0, y: 0, width: cssContentSize.width, height: cssContentSize.height, scale: 1 };
        }

        return this._captureScreenshot(clip, this._resolveScreenshotPath(filePath, 'isolated'));
    }

    /** Capture a screenshot of a specific element, clipped to its bounding rect. Returns the file path. */
    public async takeElementScreenshot (selector: any, filePath?: string): Promise<string> {
        const element = await this.resolveElement(selector);

        const rect = await this.callOnElement(element, `function () {
            this.scrollIntoView({ block: 'center', inline: 'center' });
            const rect = this.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        }`);

        await this._toTopViewport(rect);

        const scroll = await this._cdpClient.Runtime.evaluate({ expression: '({ x: window.scrollX, y: window.scrollY })', returnByValue: true });

        await (this._cdpClient as any).Page.enable();

        const clip = { ...rect, x: rect.x + scroll.result.value.x, y: rect.y + scroll.result.value.y, scale: 1 };

        return this._captureScreenshot(clip, this._resolveScreenshotPath(filePath, 'isolated-element'));
    }

    private async _captureScreenshot (clip: object | undefined, fullPath: string): Promise<string> {
        const { data } = await (this._cdpClient as any).Page.captureScreenshot({
            format:                'png',
            clip,
            captureBeyondViewport: !!clip,
        });

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, Buffer.from(data, 'base64'));

        return fullPath;
    }

    // =====================================================================
    // File upload
    // =====================================================================

    /** Set files on a <input type="file"> element via CDP DOM.setFileInputFiles. */
    public async setFilesToUpload (selector: any, filePaths: string | string[]): Promise<void> {
        const element = await this.resolveElement(selector, { visibilityCheck: false });
        const files   = Array.isArray(filePaths) ? filePaths : [filePaths];

        const resolvedFiles = files.map(f => path.resolve(f));

        for (const f of resolvedFiles) {
            if (!fs.existsSync(f))
                throw new Error(`setFilesToUpload: file not found: ${f}`);
        }

        await this.callOnElement(element, FILE_INPUT_CHECK_FN);

        await (this._cdpClient as any).DOM.enable();

        await (this._cdpClient as any).DOM.setFileInputFiles({
            files:    resolvedFiles,
            objectId: element.objectId,
        });

        // DOM.setFileInputFiles acks before the renderer has applied the files —
        // reading el.files immediately races and sees the old (empty) list.
        // Poll until they land instead of returning a silent maybe.
        const startTime = Date.now();

        while (true) {
            const count = await this.callOnElement(element, 'function () { return this.files ? this.files.length : -1; }');

            if (count === resolvedFiles.length)
                return;

            if (Date.now() - startTime >= 3000)
                throw new Error(`setFilesToUpload: expected ${resolvedFiles.length} file(s) on the input, found ${count} after 3000ms`);

            await delay(50);
        }
    }

    /** Clear files from a <input type="file"> element. */
    public async clearUpload (selector: any): Promise<void> {
        const element = await this.resolveElement(selector, { visibilityCheck: false });

        await this.callOnElement(element, FILE_INPUT_CHECK_FN);

        // Assigning an empty DataTransfer FileList leaves the files in place (Chrome 154)
        await this.callOnElement(element, `function () {
            this.value = '';
            this.dispatchEvent(new Event('change', { bubbles: true }));
        }`);
    }

    // =====================================================================
    // Page load timeout
    // =====================================================================

    /** Set the timeout (ms) for navigateTo page load waits. Default: 30000ms. */
    public setPageLoadTimeout (timeout: number): void {
        this._pageLoadTimeout = timeout;
    }

    // =====================================================================
    // Window management
    // =====================================================================

    // Set window bounds (position + size) via CDP
    public async setWindowBounds (bounds: { left?: number; top?: number; width?: number; height?: number }): Promise<void> {
        const browserClient = await this._getBrowserLevelClient();
        const { windowId }  = await browserClient.Browser.getWindowForTarget({ targetId: this.nativeAutomation.targetId });

        await browserClient.Browser.setWindowBounds({ windowId, bounds });
    }

    public async maximizeWindow (): Promise<void> {
        const browserClient = await this._getBrowserLevelClient();
        const { windowId }  = await browserClient.Browser.getWindowForTarget({ targetId: this.nativeAutomation.targetId });

        await browserClient.Browser.setWindowBounds({ windowId, bounds: { windowState: 'maximized' } });
    }

    public async resizeWindow (width: number, height: number): Promise<void> {
        const browserClient = await this._getBrowserLevelClient();
        const { windowId }  = await browserClient.Browser.getWindowForTarget({ targetId: this.nativeAutomation.targetId });

        // Ensure window is in normal state first (can't resize maximized windows)
        await browserClient.Browser.setWindowBounds({ windowId, bounds: { windowState: 'normal' } });
        await browserClient.Browser.setWindowBounds({ windowId, bounds: { width, height } });
    }

    // Get a browser-level CDP client (reuse the parent test run's provider)
    private async _getBrowserLevelClient (): Promise<any> {
        const plugin = this.parentTestRun.browserConnection.provider.plugin;

        return plugin.getBrowserLevelCDPClient(this.parentTestRun.browserConnection.id);
    }

    // =====================================================================
    // Iframe support
    // =====================================================================

    /** Switch the eval/command context into an iframe: its frame's main-world execution context. */
    public async switchToIframe (selector: any): Promise<void> {
        const element = await this.resolveElement(selector);

        await this.callOnElement(element, `function () {
            if (this.tagName !== 'IFRAME' && this.tagName !== 'FRAME')
                throw new Error('Element is not an iframe: ' + this.tagName);
        }`);

        const startTime = Date.now();
        let contextId   = void 0;

        while (!contextId) {
            const { node } = await (this._cdpClient as any).DOM.describeNode({ objectId: element.objectId });

            contextId = node.frameId && this._frameContexts.get(node.frameId);

            if (!contextId && Date.now() - startTime >= this._pageLoadTimeout)
                throw new Error(`Isolated session: the iframe has no loaded document: ${element.description}`);

            if (!contextId)
                await delay(50);
        }

        this._currentContextId = contextId;
        this._frameElements.push(element);
    }

    // Switch back to the main frame's evaluation context
    public async switchToMainWindow (): Promise<void> {
        this._currentContextId = void 0;
        this._frameElements    = [];
    }

    private _trackFrameContexts (): void {
        const { Runtime } = this._cdpClient;

        Runtime.on('executionContextCreated', ({ context }) => {
            if (context.auxData?.isDefault && context.auxData.frameId)
                this._frameContexts.set(context.auxData.frameId, context.id);
        });

        Runtime.on('executionContextDestroyed', ({ executionContextId }) => {
            for (const [frameId, contextId] of this._frameContexts) {
                if (contextId === executionContextId)
                    this._frameContexts.delete(frameId);
            }
        });

        Runtime.on('executionContextsCleared', () => this._frameContexts.clear());
    }

    private _handleNativeDialogs (): void {
        const { Page } = this._cdpClient;

        Page.on('javascriptDialogOpening', ({ type, message, url }) => {
            const leavePage = type === 'beforeunload';

            if (!leavePage && !this._unexpectedDialog)
                this._unexpectedDialog = { type, message, url };

            Page.handleJavaScriptDialog({ accept: leavePage }).catch(noop);
        });
    }

    public throwUnexpectedDialog (): void {
        const dialog = this._unexpectedDialog;

        if (!dialog)
            return;

        this._unexpectedDialog = null;

        throw new Error(
            `Isolated session: a native ${dialog.type} dialog ("${dialog.message}") was invoked on page ${dialog.url}. ` +
            'Isolated sessions dismiss native dialogs (confirm returns false, prompt returns null) and fail the next t2 command. ' +
            `Stub window.${dialog.type} with t2.eval() before the action if the dialog is expected.`
        );
    }

    // =====================================================================
    // HTTP Auth
    // =====================================================================

    // Set HTTP basic auth headers for the isolated session.
    // NOTE: the header is attached to EVERY request from this tab, including ones to
    // third-party origins — do not use with pages that load cross-origin resources
    // unless leaking the credentials there is acceptable.
    public async setHttpAuth (username: string, password: string): Promise<void> {
        const encoded = Buffer.from(`${username}:${password}`).toString('base64');

        // Extra headers only take effect while the Network domain is enabled —
        // isolated windows skip start(), so nothing enabled it yet
        await this._cdpClient.Network.enable({});

        await this._cdpClient.Network.setExtraHTTPHeaders({
            headers: { Authorization: `Basic ${encoded}` },
        });
    }

    // =====================================================================
    // Selector utilities
    // =====================================================================

    // Types for parsed selector chain arguments
    private static _PARSED_ARG_STRING = 'string' as const;
    private static _PARSED_ARG_NUMBER = 'number' as const;
    private static _PARSED_ARG_REGEX = 'regex' as const;

    // =====================================================================
    // Selector chain parsing
    // =====================================================================

    // Parse a chain entry like ".withText('hello')" into { method, args }
    private _parseChainMethod (entry: string): { method: string; args: Array<{ type: string; value?: any; source?: string; flags?: string }> } {
        const match = entry.match(/^\.(\w+)\(([\s\S]*)\)$/);

        if (!match)
            throw new Error(`Cannot parse selector chain method: ${entry}`);

        const method  = match[1];
        const rawArgs = match[2].trim();

        if (!rawArgs)
            return { method, args: [] };

        return { method, args: this._parseChainArgs(rawArgs) };
    }

    // Parse comma-separated arguments: strings, numbers, regexes
    private _parseChainArgs (rawArgs: string): Array<{ type: string; value?: any; source?: string; flags?: string }> {
        const args: Array<{ type: string; value?: any; source?: string; flags?: string }> = [];
        let remaining = rawArgs.trim();

        while (remaining) {
            remaining = remaining.replace(/^,\s*/, '');

            if (!remaining) break;

            const strMatch = remaining.match(/^'((?:[^'\\]|\\.)*)'/);

            if (strMatch) {
                args.push({ type: IsolatedSession._PARSED_ARG_STRING, value: strMatch[1].replace(/\\'/g, "'") });
                remaining = remaining.slice(strMatch[0].length).trim();
                continue;
            }

            const reMatch = remaining.match(/^\/((?:[^/\\]|\\.)*)\/([gimsuy]*)/);

            if (reMatch) {
                args.push({ type: IsolatedSession._PARSED_ARG_REGEX, source: reMatch[1], flags: reMatch[2] });
                remaining = remaining.slice(reMatch[0].length).trim();
                continue;
            }

            const numMatch = remaining.match(/^(-?\d+(?:\.\d+)?)/);

            if (numMatch) {
                args.push({ type: IsolatedSession._PARSED_ARG_NUMBER, value: Number(numMatch[1]) });
                remaining = remaining.slice(numMatch[0].length).trim();
                continue;
            }

            if (remaining.startsWith('[function]'))
                throw new Error('Isolated sessions do not support function-based selector filters');

            throw new Error(`Cannot parse selector argument: ${remaining}`);
        }

        return args;
    }

    // =====================================================================
    // Selector chain → JavaScript code generation
    // =====================================================================

    // Route a parsed chain step to the appropriate JS generator
    private _chainStepToJS (step: { method: string; args: any[] }): string {
        switch (step.method) {
            case 'withText': return this._genWithText(step.args[0]);
            case 'withExactText': return this._genWithExactText(step.args[0]);
            case 'filterVisible': return this._genFilterVisible();
            case 'filterHidden': return this._genFilterHidden();
            case 'nth': return this._genNth(step.args[0]);
            case 'find': return this._genFind(step.args[0]);
            case 'parent': return this._genTraversal('parent', step.args[0]);
            case 'child': return this._genTraversal('child', step.args[0]);
            case 'sibling': return this._genTraversal('sibling', step.args[0]);
            case 'nextSibling': return this._genTraversal('nextSibling', step.args[0]);
            case 'prevSibling': return this._genTraversal('prevSibling', step.args[0]);
            case 'withAttribute': return this._genWithAttribute(step.args[0], step.args[1]);

            case 'filter':
                throw new Error(
                    'Isolated sessions do not support .filter(fn). ' +
                    'Use .withText(), .withAttribute(), or a CSS selector instead.'
                );

            default:
                throw new Error(`Isolated sessions do not support .${step.method}() in selector chains.`);
        }
    }

    // Escape a string for embedding in single-quoted JS
    private _escJS (str: string): string {
        return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    }

    // Build a JS text-match expression against variable 't'
    private _argToTextMatch (arg: any): string {
        if (arg.type === IsolatedSession._PARSED_ARG_STRING)
            return `t.indexOf('${this._escJS(arg.value)}') !== -1`;

        if (arg.type === IsolatedSession._PARSED_ARG_REGEX)
            return `/${arg.source}/${arg.flags}.test(t)`;

        throw new Error(`Expected string or regex argument for text filter, got ${arg.type}`);
    }

    private _genWithText (arg: any): string {
        const check = this._argToTextMatch(arg);

        return `nodes = nodes.filter(function(el) { var t = el.innerText || el.textContent || ''; return ${check}; });`;
    }

    private _genWithExactText (arg: any): string {
        if (arg.type !== IsolatedSession._PARSED_ARG_STRING)
            throw new Error('withExactText requires a string argument');

        return `nodes = nodes.filter(function(el) { var t = (el.innerText || el.textContent || '').trim(); return t === '${this._escJS(arg.value)}'; });`;
    }

    private _genFilterVisible (): string {
        return 'nodes = nodes.filter(function(el) {' +
            ' if (el.nodeType !== 1) return false;' +
            ' var rect = el.getBoundingClientRect();' +
            ' if (rect.width === 0 && rect.height === 0) return false;' +
            ' var s = window.getComputedStyle(el);' +
            ' return s.display !== "none" && s.visibility !== "hidden";' +
            ' });';
    }

    private _genFilterHidden (): string {
        return 'nodes = nodes.filter(function(el) {' +
            ' if (el.nodeType !== 1) return true;' +
            ' var rect = el.getBoundingClientRect();' +
            ' if (rect.width === 0 && rect.height === 0) return true;' +
            ' var s = window.getComputedStyle(el);' +
            ' return s.display === "none" || s.visibility === "hidden";' +
            ' });';
    }

    private _genNth (arg: any): string {
        if (arg.type !== IsolatedSession._PARSED_ARG_NUMBER)
            throw new Error('nth requires a number argument');

        const idx = arg.value;

        return `nodes = (function(arr) { var el = ${idx} < 0 ? arr[arr.length + (${idx})] : arr[${idx}]; return el ? [el] : []; })(nodes);`;
    }

    private _genFind (arg: any): string {
        if (!arg || arg.type === IsolatedSession._PARSED_ARG_STRING) {
            const css = arg ? this._escJS(arg.value) : '*';

            return `nodes = (function(arr) { var r = [];` +
                ` for (var i = 0; i < arr.length; i++) { var f = arr[i].querySelectorAll('${css}');` +
                ` for (var j = 0; j < f.length; j++) { if (r.indexOf(f[j]) === -1) r.push(f[j]); } }` +
                ` return r; })(nodes);`;
        }

        throw new Error('Isolated sessions only support .find(cssSelector)');
    }

    // Unified generator for parent/child/sibling/nextSibling/prevSibling
    private _genTraversal (kind: string, arg?: any): string {
        const argType = arg ? arg.type : void 0;

        // Each traversal collects related nodes from the DOM, optionally filtered
        // by CSS match or picked by numeric index.
        //
        // The generated JS uses an inline helper `_collect` that returns an array
        // of related nodes for a single source node.

        let collectBody: string;

        if (kind === 'parent')
            collectBody = 'var r=[]; for(var p=n.parentNode;p;p=p.parentNode){if(p.nodeType===1)r.push(p);} return r;';
        else if (kind === 'child')
            collectBody = 'var r=[]; for(var j=0;j<n.childNodes.length;j++){if(n.childNodes[j].nodeType===1)r.push(n.childNodes[j]);} return r;';
        else if (kind === 'sibling')
            collectBody = 'var r=[],p=n.parentNode; if(!p)return r; for(var j=0;j<p.childNodes.length;j++){var c=p.childNodes[j]; if(c.nodeType===1&&c!==n)r.push(c);} return r;';
        else if (kind === 'nextSibling')
            collectBody = 'var r=[],s=n.nextSibling; while(s){if(s.nodeType===1)r.push(s); s=s.nextSibling;} return r;';
        else if (kind === 'prevSibling')
            collectBody = 'var r=[],s=n.previousSibling; while(s){if(s.nodeType===1)r.push(s); s=s.previousSibling;} return r;';
        else
            throw new Error(`Unknown traversal kind: ${kind}`);

        const collectFn = `function _c(n){${collectBody}}`;

        if (!arg) {
            return `nodes = (function(arr) { ${collectFn}` +
                ` var r=[]; for(var i=0;i<arr.length;i++){var rel=_c(arr[i]); for(var j=0;j<rel.length;j++){if(r.indexOf(rel[j])===-1)r.push(rel[j]);}}` +
                ` return r; })(nodes);`;
        }

        if (argType === IsolatedSession._PARSED_ARG_NUMBER) {
            const idx = arg.value;

            return `nodes = (function(arr) { ${collectFn}` +
                ` var r=[]; for(var i=0;i<arr.length;i++){var rel=_c(arr[i]);` +
                ` var el=${idx}<0?rel[rel.length+(${idx})]:rel[${idx}];` +
                ` if(el&&r.indexOf(el)===-1)r.push(el);}` +
                ` return r; })(nodes);`;
        }

        if (argType === IsolatedSession._PARSED_ARG_STRING) {
            const css = this._escJS(arg.value);

            return `nodes = (function(arr) { ${collectFn}` +
                ` var m=Array.from(document.querySelectorAll('${css}'));` +
                ` var r=[]; for(var i=0;i<arr.length;i++){var rel=_c(arr[i]); for(var j=0;j<rel.length;j++){if(m.indexOf(rel[j])!==-1&&r.indexOf(rel[j])===-1)r.push(rel[j]);}}` +
                ` return r; })(nodes);`;
        }

        throw new Error(`Isolated sessions do not support .${kind}() with ${argType} argument`);
    }

    private _genWithAttribute (nameArg: any, valueArg?: any): string {
        if (!valueArg) {
            if (nameArg.type === IsolatedSession._PARSED_ARG_STRING)
                return `nodes = nodes.filter(function(el) { return el.nodeType === 1 && el.hasAttribute('${this._escJS(nameArg.value)}'); });`;

            if (nameArg.type === IsolatedSession._PARSED_ARG_REGEX)
                return `nodes = nodes.filter(function(el) { if(el.nodeType!==1)return false; for(var i=0;i<el.attributes.length;i++){if(/${nameArg.source}/${nameArg.flags}.test(el.attributes[i].nodeName))return true;} return false; });`;

            throw new Error(`withAttribute: unsupported name argument type: ${nameArg.type}`);
        }

        let nameCheck: string;

        if (nameArg.type === IsolatedSession._PARSED_ARG_STRING)
            nameCheck = `a.nodeName==='${this._escJS(nameArg.value)}'`;
        else if (nameArg.type === IsolatedSession._PARSED_ARG_REGEX)
            nameCheck = `/${nameArg.source}/${nameArg.flags}.test(a.nodeName)`;
        else
            throw new Error(`withAttribute: unsupported name type: ${nameArg.type}`);

        let valCheck: string;

        if (valueArg.type === IsolatedSession._PARSED_ARG_STRING)
            valCheck = `a.nodeValue==='${this._escJS(valueArg.value)}'`;
        else if (valueArg.type === IsolatedSession._PARSED_ARG_REGEX)
            valCheck = `/${valueArg.source}/${valueArg.flags}.test(a.nodeValue)`;
        else
            throw new Error(`withAttribute: unsupported value type: ${valueArg.type}`);

        return `nodes = nodes.filter(function(el) { if(el.nodeType!==1)return false; for(var i=0;i<el.attributes.length;i++){var a=el.attributes[i]; if(${nameCheck}&&${valCheck})return true;} return false; });`;
    }

    // =====================================================================
    // Cookie operations via CDP directly on the isolated context
    // =====================================================================

    private _parseCookieUrls (urls: string[]): { domain: string, path: string }[] {
        return urls.map(url => {
            const { hostname, pathname } = new URL(url);

            return { domain: hostname, path: pathname };
        });
    }

    // Cookies set with an explicit domain are stored dot-prefixed ('.localhost') —
    // compare without the leading dot so filters like { domain: 'localhost' } match
    private _normalizeCookieDomain (domain: string): string {
        return domain.replace(/^\./, '');
    }

    private _cookieMatchesFilter (cookie: any, filter: any): boolean {
        if (filter.name && filter.name !== cookie.name)
            return false;

        if (filter.domain && this._normalizeCookieDomain(filter.domain) !== this._normalizeCookieDomain(cookie.domain))
            return false;

        if (filter.path && filter.path !== cookie.path)
            return false;

        return true;
    }

    // Read the isolated context's cookies. Storage.getCookies on the TAB session
    // returns the DEFAULT browser context's cookies — it must be called on the
    // browser-level connection with an explicit browserContextId.
    private async _getContextCookies (): Promise<any[]> {
        const browserClient = await this._getBrowserLevelClient();
        const { cookies }   = await browserClient.Storage.getCookies({ browserContextId: this.browserContextId });

        return cookies;
    }

    private async _getCookies (externalCookies: any[] = [], urls: string[] = []): Promise<any[]> {
        const cookies = await this._getContextCookies();

        if (!externalCookies.length)
            return cookies.map(this._cdpCookieToExternal);

        const parsedUrls = this._parseCookieUrls(urls);

        return cookies
            .filter(cookie => externalCookies.some(filter => {
                // A filter without both domain and path is scoped by the provided urls,
                // mirroring the non-isolated CookieProvider#getCookies behavior.
                if (filter.domain && filter.path || !parsedUrls.length)
                    return this._cookieMatchesFilter(cookie, filter);

                return parsedUrls.some(url =>
                    this._cookieMatchesFilter(cookie, { ...filter, domain: url.domain, path: url.path }));
            }))
            .map(this._cdpCookieToExternal);
    }

    // CDP expects cookie expiry as seconds since epoch. Accepts a Date, a parseable
    // date string (role snapshots arrive JSON-parsed), or a number; anything else
    // (including TestCafe's 'Infinity') becomes a session cookie, which outlives
    // the isolated context anyway.
    private _cookieExpiresToSeconds (expires: any): number | undefined {
        if (expires instanceof Date)
            return expires.getTime() / 1000;

        if (expires === 'Infinity')
            return void 0;

        if (typeof expires === 'string') {
            const parsed = Date.parse(expires);

            // An unparseable date string is a caller bug — silently making a session
            // cookie out of it would hide the mistake
            if (isNaN(parsed))
                throw new Error(`Isolated session: cannot parse cookie 'expires' value: ${expires}`);

            return parsed / 1000;
        }

        if (typeof expires === 'number' && isFinite(expires)) {
            // Heuristic: values this large can only be milliseconds
            return expires > 1e11 ? expires / 1000 : expires;
        }

        return void 0;
    }

    private async _setCookies (cookies: any[], url: string): Promise<void> {
        const { hostname = '', pathname = '/' } = url ? new URL(url) : {};
        const cookieParams = Array.isArray(cookies) ? cookies : [cookies];

        // Chrome rejects cookies that have neither a domain nor a URL — and
        // Network.setCookies drops rejected cookies without reporting them
        for (const cookie of cookieParams) {
            if (!cookie.domain && !hostname)
                throw new Error(`Isolated session: cannot set cookie '${cookie.name}' — no domain given and no URL to derive one from.`);
        }

        await this._cdpClient.Network.setCookies({
            cookies: cookieParams.map(cookie => ({
                name:     cookie.name,
                value:    cookie.value,
                domain:   cookie.domain ?? hostname,
                path:     cookie.path ?? pathname,
                secure:   cookie.secure,
                httpOnly: cookie.httpOnly,
                sameSite: cookie.sameSite,
                expires:  this._cookieExpiresToSeconds(cookie.expires),
            })),
        });
    }

    private async _deleteCookies (cookies: any[] = [], urls: string[] = []): Promise<void> {
        if (!cookies || !cookies.length)
            return this._cdpClient.Network.clearBrowserCookies();

        const existing   = await this._getContextCookies();
        const parsedUrls = this._parseCookieUrls(urls);

        for (const cookie of existing) {
            if (parsedUrls.length && !parsedUrls.some(url => this._normalizeCookieDomain(url.domain) === this._normalizeCookieDomain(cookie.domain) && url.path === cookie.path))
                continue;

            if (cookies.some(filter => this._cookieMatchesFilter(cookie, filter))) {
                await this._cdpClient.Network.deleteCookies({
                    name:   cookie.name,
                    domain: cookie.domain,
                    path:   cookie.path,
                });
            }
        }

        return void 0;
    }

    private _cdpCookieToExternal (cookie: any): any {
        return {
            name:     cookie.name,
            value:    cookie.value,
            domain:   cookie.domain,
            path:     cookie.path,
            secure:   cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite ?? 'none',
        };
    }

    // =====================================================================
    // Role management for isolated sessions
    // =====================================================================

    private async _useRole (role: Role): Promise<void> {
        if (role.phase === ROLE_PHASE.uninitialized) {
            throw new Error(
                'Isolated sessions cannot initialize roles. ' +
                'Use the role in the main test controller first, then use it in the isolated session.'
            );
        }

        const stateSnapshot = role.stateSnapshot;

        if (!stateSnapshot) {
            throw new Error(
                'Role has no state snapshot. Ensure the role has been used by the main test controller before using it in an isolated session.'
            );
        }

        await this._deleteCookies();

        if (stateSnapshot.cookies) {
            let roleCookies: any[] = [];

            try {
                roleCookies = JSON.parse(stateSnapshot.cookies);

                await this._setCookies(roleCookies, '');
            }
            catch (e: any) {
                throw new Error(`Failed to apply role cookies in isolated session: ${e.message}`);
            }

            // Network.setCookies drops cookies Chrome rejects (e.g. __Host- prefixed
            // cookies with a domain attribute) without any error — verify they landed
            const applied      = await this._getContextCookies();
            const appliedNames = new Set(applied.map(c => c.name));
            const missing      = roleCookies.filter(c => c.name && !appliedNames.has(c.name)).map(c => c.name);

            if (missing.length) {
                throw new Error(
                    `Isolated session: the browser rejected the following role cookies: ${missing.join(', ')}. ` +
                    'The role state would be incomplete.'
                );
            }
        }

        // Storage snapshots need a page on the role's origin — about:blank has no
        // usable localStorage. Apply immediately when the session is already on a real
        // page; otherwise stash them and apply after the next navigateTo.
        const storages = stateSnapshot.storages;

        if (storages && (this._hasStorageEntries(storages.localStorage) || this._hasStorageEntries(storages.sessionStorage))) {
            this._pendingRoleStorages = storages;

            const onRealPage = await this.evaluateExpression("location.origin !== 'null' && location.protocol !== 'about:'");

            if (onRealPage)
                await this._applyPendingRoleStorages();
        }
    }

    // A hammerhead storage snapshot is a JSON string of [[keys], [values]]
    private _hasStorageEntries (snapshot: string | undefined): boolean {
        return !!snapshot && snapshot !== '[[],[]]';
    }

    private async _applyPendingRoleStorages (): Promise<void> {
        if (!this._pendingRoleStorages)
            return;

        const { localStorage: localSnapshot, sessionStorage: sessionSnapshot } = this._pendingRoleStorages;

        await this.evaluateExpression(`
            (function() {
                function applySnapshot(storage, snapshot) {
                    if (!snapshot) return;
                    const parsed = JSON.parse(snapshot);
                    const keys = parsed[0] || [];
                    const values = parsed[1] || [];
                    if (keys.length !== values.length)
                        throw new Error('Malformed storage snapshot: ' + keys.length + ' keys vs ' + values.length + ' values');
                    for (let i = 0; i < keys.length; i++)
                        storage.setItem(keys[i], values[i]);
                }
                applySnapshot(window.localStorage, ${JSON.stringify(localSnapshot || '')});
                applySnapshot(window.sessionStorage, ${JSON.stringify(sessionSnapshot || '')});
            })()
        `);

        // Only forget the snapshot once it has actually been applied — a failure above
        // keeps it pending for the next navigation instead of dropping it silently
        this._pendingRoleStorages = null;
    }

    // =====================================================================
    // Cleanup
    // =====================================================================

    /** Dispose the isolated session: close the CDP WebSocket, then destroy the browser context. */
    public async dispose (): Promise<void> {
        if (this._disposed)
            return;

        this._disposed = true;

        // Best-effort teardown: a cleanup failure must not mask the test result.
        try {
            await this.nativeAutomation.dispose();
        }
        catch (e) {
            // ignore
        }

        try {
            const plugin = this.parentTestRun.browserConnection.provider.plugin;

            await plugin.disposeIsolatedSession(
                this.parentTestRun.browserConnection.id,
                this.browserContextId
            );
        }
        catch (e) {
            // ignore
        }
    }
}
