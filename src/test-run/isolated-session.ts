// IsolatedSession — manages CDP browser context lifecycle, command routing, and eval
import { nanoid } from 'nanoid';
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
import { navigateTo } from '../native-automation/utils/cdp';

import type TestRun from './index';
import type { IsolatedTestController } from '../api/test-controller/isolated';

import ReExecutablePromise from '../utils/re-executable-promise';

import * as path from 'path';
import * as fs from 'fs';

// Wait for page load after navigation
const PAGE_LOAD_TIMEOUT = 30000;

// Drag step count for smooth drag operations
const DRAG_STEPS = 10;

// Small delay between drag steps (~60fps)
const DRAG_STEP_DELAY = 16;

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

    // Configurable page load timeout (default: PAGE_LOAD_TIMEOUT constant)
    private _pageLoadTimeout: number;

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

        // The CDP client for the isolated tab
        this._cdpClient = nativeAutomation.cdpClient;
    }

    /**
     * Execute a TestCafe command directly via CDP. Dispatches to the appropriate
     * CDP method based on command type (click → Input.dispatchMouseEvent,
     * typeText → Input.insertText, navigateTo → Page.navigate, etc.).
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            return this._evaluateExpression((command as any).expression);

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

    private async _executeAssertion (command: any, callsite?: CallsiteRecord | string): Promise<void> {
        const reExecutable = command.actual instanceof ReExecutablePromise ? command.actual : null;
        const timeout      = command.options?.timeout || 3000;
        const startTime    = Date.now();

        // eslint-disable-next-line no-constant-condition
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

    // =====================================================================
    // Selector execution via CDP
    // =====================================================================

    // Execute a selector command directly in the isolated tab via CDP.
    // Returns a number (counter mode) or a plain snapshot object (snapshot mode).
    public async _executeSelectorViaCDP (command: any): Promise<unknown> {
        const selector = command;

        if (!selector.apiFnChain || !selector.apiFnChain.length)
            throw new Error('Isolated session: selector command has no apiFnChain');

        // Counter mode: just count matching elements
        if (selector.counterMode) {
            const countExpr = this._compileSelectorExpression(selector, 'count');
            const countResult = await this.evaluateExpression(countExpr);

            // Wrap in array: the replicator's decode() expects encode()-format
            // (encode wraps values in [value], decode returns references[0])
            return [countResult];
        }

        // Snapshot mode: find element and extract all properties
        const snapshotExpr = this._compileSelectorExpression(selector, 'snapshot');
        const result       = await this.evaluateExpression(snapshotExpr);

        // getVisibleValueMode: return null without error when element not found
        if (result === null && selector.getVisibleValueMode)
            return [null];

        if (result === null && selector.needError)
            throw new Error(`Isolated session: element not found for selector ${selector.apiFnChain.join('')}`);

        return [result];
    }

    // Compile a selector's apiFnChain into a JS expression.
    // returnMode: 'count' returns nodes.length, 'snapshot' returns element snapshot object
    private _compileSelectorExpression (selector: any, returnMode: 'count' | 'snapshot'): string {
        const chain = selector.apiFnChain;
        const chainEntry = chain[0];
        const cssMatch = chainEntry.match(/Selector\s*\(\s*'((?:[^'\\]|\\.)*)'\s*\)/)
            || chainEntry.match(/Selector\s*\(\s*"((?:[^"\\]|\\.)*)"\s*\)/);

        if (!cssMatch) {
            if (chainEntry.includes('[function]'))
                throw new Error(`Isolated sessions only support CSS string selectors. Function-form selector not supported: ${chainEntry}`);

            throw new Error(`Isolated sessions only support CSS string selectors. Cannot parse selector: ${chainEntry}`);
        }

        const baseCss = cssMatch[1];

        // Build chain steps
        const steps: string[] = [];

        for (let i = 1; i < chain.length; i++) {
            const parsed = this._parseChainMethod(chain[i]);

            steps.push(this._chainStepToJS(parsed));
        }

        const nodesInit = `var nodes = Array.from(document.querySelectorAll(${JSON.stringify(baseCss)}));`;
        const chainCode = steps.length ? ` ${steps.join(' ')}` : '';

        if (returnMode === 'count')
            return `(function() { ${nodesInit}${chainCode} return nodes.length; })()`;

        // Snapshot mode: return a full element snapshot from the first matched node
        return `(function() {
            ${nodesInit}${chainCode}
            var el = nodes[0];
            if (!el) return null;
            var s = window.getComputedStyle(el);
            var rect = el.getBoundingClientRect();
            var attrs = {};
            if (el.attributes) { for (var i = 0; i < el.attributes.length; i++) { attrs[el.attributes[i].name] = el.attributes[i].value; } }
            var cls = el.className ? el.className.toString().split(/\\s+/).filter(function(c){return c;}) : [];
            var isVis = el.nodeType === 1 && !(rect.width === 0 && rect.height === 0) && s.display !== 'none' && s.visibility !== 'hidden';
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
        })()`;
    }

    // =====================================================================
    // ClientFunction execution via CDP
    // =====================================================================

    public async _executeClientFunctionViaCDP (command: any): Promise<unknown> {
        const fnCode = command.fnCode;

        if (!fnCode)
            throw new Error('Isolated session: ClientFunction command has no fnCode');

        // The fnCode is a compiled IIFE. It expects __dependencies$ to be available.
        // For simple ClientFunctions (no dependencies), we can just wrap and execute.
        // For complex ones, we inject dependencies first.
        const depsCode = command.dependencies
            ? `var __dependencies$ = ${JSON.stringify(command.dependencies)};`
            : 'var __dependencies$ = {};';

        const expression = `(function() { ${depsCode} var __f$ = ${fnCode}; return typeof __f$ === 'function' ? __f$() : __f$; })()`;

        // Wrap in array: the replicator's decode() expects encode()-format
        const result = await this.evaluateExpression(expression);

        return [result];
    }

    // =====================================================================
    // Navigation
    // =====================================================================

    private async _navigateTo (url: string): Promise<void> {
        await navigateTo(this._cdpClient, url);
        await this._waitForPageLoad();
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

        if (result.exceptionDetails) {
            const errText = result.exceptionDetails.exception?.description
                || result.exceptionDetails.text
                || 'Expression evaluation failed';

            throw new Error(`Isolated session eval error: ${errText}`);
        }

        return result.result.value;
    }

    // Keep underscore alias for backward compatibility with IsolatedTestController._eval$
    public async _evaluateExpression (expression: string): Promise<unknown> {
        return this.evaluateExpression(expression);
    }

    // Returns contextId param for Runtime.evaluate when inside an iframe
    private _contextIdParam (): { contextId?: number } {
        return this._currentContextId !== void 0 ? { contextId: this._currentContextId } : {};
    }

    // =====================================================================
    // Mouse interactions
    // =====================================================================

    private async _getElementCenter (command: any): Promise<{ x: number; y: number }> {
        const selectorQuery = this._getSelectorForQuerySelector(command.selector);

        return await this.evaluateExpression(`
            (function() {
                const el = ${selectorQuery};
                if (!el) throw new Error('Element not found: ' + ${JSON.stringify(String(command.selector))});
                el.scrollIntoView({ block: 'center', inline: 'center' });
                const rect = el.getBoundingClientRect();
                return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
            })()
        `) as { x: number; y: number };
    }

    // Click an element via CDP input dispatch
    private async _cdpClick (command: any, button: 'left' | 'right' = 'left', clickCount = 1): Promise<void> {
        const coords = await this._getElementCenter(command);

        // Move to element first (triggers hover/mouseenter events)
        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseMoved', x: coords.x, y: coords.y,
        });

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mousePressed', x: coords.x, y: coords.y, button, clickCount,
        });

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseReleased', x: coords.x, y: coords.y, button, clickCount,
        });
    }

    // Hover over an element (mouseMoved without press)
    private async _cdpHover (command: any): Promise<void> {
        const coords = await this._getElementCenter(command);

        await this._cdpClient.Input.dispatchMouseEvent({
            type: 'mouseMoved', x: coords.x, y: coords.y,
        });
    }

    // Drag an element by pixel offset
    private async _cdpDrag (command: any): Promise<void> {
        const start = await this._getElementCenter(command);
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
        const start     = await this._getElementCenter(command);
        const destQuery = this._getSelectorForQuerySelector((command as any).destinationSelector);

        const end = await this.evaluateExpression(`
            (function() {
                const el = ${destQuery};
                if (!el) throw new Error('Destination element not found for dragToElement');
                el.scrollIntoView({ block: 'center', inline: 'center' });
                const rect = el.getBoundingClientRect();
                return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
            })()
        `) as { x: number; y: number };

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

        // Click the element to focus it
        await this._cdpClick(command);

        // Select existing text if replace option is set
        if ((command as any).options?.replace) {
            const selectorQuery = this._getSelectorForQuerySelector(command.selector);

            await this.evaluateExpression(`
                (function() {
                    const el = ${selectorQuery};
                    if (!el) return;
                    if (typeof el.select === 'function')
                        el.select();
                    else if (typeof el.setSelectionRange === 'function')
                        el.setSelectionRange(0, el.value.length);
                    else
                        document.execCommand('selectAll');
                })()
            `);
        }

        // Insert the text
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

        // Map of known keyboard shortcut commands
        const SHORTCUT_COMMANDS: Record<string, string[]> = {
            'ctrl+a': ['selectAll'],
            'ctrl+c': ['copy'],
            'ctrl+v': ['paste'],
            'ctrl+x': ['cut'],
            'ctrl+z': ['undo'],
            'ctrl+y': ['redo'],
        };

        // Map key name to CDP code and keyCode
        const KEY_CODE_MAP: Record<string, { code: string; keyCode: number }> = {
            'enter':      { code: 'Enter', keyCode: 13 },
            'tab':        { code: 'Tab', keyCode: 9 },
            'escape':     { code: 'Escape', keyCode: 27 },
            'backspace':  { code: 'Backspace', keyCode: 8 },
            'delete':     { code: 'Delete', keyCode: 46 },
            'space':      { code: 'Space', keyCode: 32 },
            'arrowup':    { code: 'ArrowUp', keyCode: 38 },
            'arrowdown':  { code: 'ArrowDown', keyCode: 40 },
            'arrowleft':  { code: 'ArrowLeft', keyCode: 37 },
            'arrowright': { code: 'ArrowRight', keyCode: 39 },
            'home':       { code: 'Home', keyCode: 36 },
            'end':        { code: 'End', keyCode: 35 },
            'pageup':     { code: 'PageUp', keyCode: 33 },
            'pagedown':   { code: 'PageDown', keyCode: 34 },
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

            // Look up shortcut commands for this combo
            const comboLower  = combo.toLowerCase();
            const cmdCommands = SHORTCUT_COMMANDS[comboLower] || [];

            // Hold modifiers down
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

            // Press and release regular keys
            for (const key of regularKeys) {
                const keyLower = key.toLowerCase();
                const keyInfo  = KEY_CODE_MAP[keyLower];
                const code     = keyInfo?.code || `Key${key.toUpperCase()}`;
                const keyCode  = keyInfo?.keyCode || key.toUpperCase().charCodeAt(0);

                await this._cdpClient.Input.dispatchKeyEvent({
                    type:                  'rawKeyDown',
                    key,
                    code,
                    windowsVirtualKeyCode: keyCode,
                    nativeVirtualKeyCode:  keyCode,
                    modifiers:             modifiersBitmask,
                    commands:              cmdCommands,
                } as any);

                await this._cdpClient.Input.dispatchKeyEvent({
                    type:                  'keyUp',
                    key,
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
        const selectorQuery = this._getSelectorForQuerySelector(command.selector);
        const startPos      = (command as any).startPos ?? 0;
        const endPos        = (command as any).endPos;
        const hasEndPos     = endPos !== null && endPos !== void 0;

        const endExpr = hasEndPos
            ? String(endPos)
            : 'el.value !== null && el.value !== void 0 ? el.value.length : el.textContent.length';

        await this.evaluateExpression(`
            (function() {
                const el = ${selectorQuery};
                if (!el) throw new Error('Element not found for selectText');
                el.focus();
                const end = ${endExpr};
                if (typeof el.setSelectionRange === 'function') {
                    el.setSelectionRange(${startPos}, end);
                }
                else {
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            })()
        `);
    }

    // =====================================================================
    // Scroll
    // =====================================================================

    private async _cdpScroll (command: any): Promise<void> {
        if (command.selector) {
            const selectorQuery = this._getSelectorForQuerySelector(command.selector);
            const position      = (command as any).position || 'center';

            await this.evaluateExpression(`
                (function() {
                    const el = ${selectorQuery};
                    if (!el) throw new Error('Element not found for scroll');
                    el.scrollIntoView({ block: ${JSON.stringify(position)}, inline: ${JSON.stringify(position)} });
                })()
            `);
        }
        else {
            const x = (command as any).x || 0;
            const y = (command as any).y || 0;

            await this.evaluateExpression(`window.scrollTo(${x}, ${y})`);
        }
    }

    private async _cdpScrollBy (command: any): Promise<void> {
        const byX = (command as any).byX || 0;
        const byY = (command as any).byY || 0;

        if (command.selector) {
            const selectorQuery = this._getSelectorForQuerySelector(command.selector);

            await this.evaluateExpression(`
                (function() {
                    const el = ${selectorQuery};
                    if (!el) throw new Error('Element not found for scrollBy');
                    el.scrollBy(${byX}, ${byY});
                })()
            `);
        }
        else
            await this.evaluateExpression(`window.scrollBy(${byX}, ${byY})`);
    }

    private async _cdpScrollIntoView (command: any): Promise<void> {
        const selectorQuery = this._getSelectorForQuerySelector(command.selector);

        await this.evaluateExpression(`
            (function() {
                const el = ${selectorQuery};
                if (!el) throw new Error('Element not found for scrollIntoView');
                el.scrollIntoView({ block: 'center', inline: 'center' });
            })()
        `);
    }

    // =====================================================================
    // Events
    // =====================================================================

    private async _cdpDispatchEvent (command: any): Promise<void> {
        const selectorQuery = this._getSelectorForQuerySelector(command.selector);
        const eventName     = (command as any).eventName;
        const eventOptions  = (command as any).options || {};

        await this.evaluateExpression(`
            (function() {
                const el = ${selectorQuery};
                if (!el) throw new Error('Element not found for dispatchEvent');
                const opts = Object.assign({ bubbles: true, cancelable: true }, ${JSON.stringify(eventOptions)});
                const event = new Event(${JSON.stringify(eventName)}, opts);
                el.dispatchEvent(event);
            })()
        `);
    }

    // =====================================================================
    // Screenshots
    // =====================================================================

    /** Capture a full-page PNG screenshot via CDP Page.captureScreenshot. Returns the file path. */
    public async takeScreenshot (filePath?: string): Promise<string> {
        // Ensure Page domain is enabled (isolated windows don't call start())
        await (this._cdpClient as any).Page.enable();

        const { data } = await (this._cdpClient as any).Page.captureScreenshot({ format: 'png' });

        const screenshotDir = filePath
            ? path.dirname(filePath)
            : path.join(process.cwd(), 'artifacts', 'screenshots');

        fs.mkdirSync(screenshotDir, { recursive: true });

        const filename = filePath
            ? path.basename(filePath)
            : `isolated-${Date.now()}.png`;

        const fullPath = path.join(screenshotDir, filename);

        fs.writeFileSync(fullPath, Buffer.from(data, 'base64'));

        return fullPath;
    }

    /** Capture a screenshot of a specific element, clipped to its bounding rect. Returns the file path. */
    public async takeElementScreenshot (selector: any, filePath?: string): Promise<string> {
        const selectorQuery = this._getSelectorForQuerySelector(selector);

        // Get element bounding rect
        const bounds = await this.evaluateExpression(`
            (function() {
                const el = ${selectorQuery};
                if (!el) throw new Error('Element not found for takeElementScreenshot');
                const rect = el.getBoundingClientRect();
                return JSON.stringify({
                    x: rect.x + window.scrollX,
                    y: rect.y + window.scrollY,
                    width: rect.width,
                    height: rect.height
                });
            })()
        `) as string;

        const clip = JSON.parse(bounds);

        clip.scale = 1;

        await (this._cdpClient as any).Page.enable();

        const { data } = await (this._cdpClient as any).Page.captureScreenshot({
            format: 'png',
            clip,
        });

        const screenshotDir = filePath
            ? path.dirname(filePath)
            : path.join(process.cwd(), 'artifacts', 'screenshots');

        fs.mkdirSync(screenshotDir, { recursive: true });

        const filename = filePath
            ? path.basename(filePath)
            : `isolated-element-${Date.now()}.png`;

        const fullPath = path.join(screenshotDir, filename);

        fs.writeFileSync(fullPath, Buffer.from(data, 'base64'));

        return fullPath;
    }

    // =====================================================================
    // File upload
    // =====================================================================

    /** Set files on a <input type="file"> element via CDP DOM.setFileInputFiles. */
    public async setFilesToUpload (selector: any, filePaths: string | string[]): Promise<void> {
        const selectorQuery = this._getSelectorForQuerySelector(selector);
        const files         = Array.isArray(filePaths) ? filePaths : [filePaths];

        // Resolve relative paths to absolute
        const resolvedFiles = files.map(f => path.resolve(f));

        // Verify all files exist
        for (const f of resolvedFiles) {
            if (!fs.existsSync(f))
                throw new Error(`setFilesToUpload: file not found: ${f}`);
        }

        // Get a remote object reference to the file input element
        const evalResult = await this._cdpClient.Runtime.evaluate({
            expression:    `(function() { const el = ${selectorQuery}; if (!el) throw new Error('File input element not found'); if (el.tagName !== 'INPUT' || el.type !== 'file') throw new Error('Element is not a file input: ' + el.tagName + '[type=' + el.type + ']'); return el; })()`,
            returnByValue: false,
            ...this._contextIdParam(),
        });

        if (evalResult.exceptionDetails)
            throw new Error(evalResult.exceptionDetails.exception?.description || 'Failed to validate file input');

        const objectId = evalResult.result.objectId;

        if (!objectId)
            throw new Error('setFilesToUpload: could not get remote object reference for file input');

        await (this._cdpClient as any).DOM.setFileInputFiles({
            files: resolvedFiles,
            objectId,
        });
    }

    /** Clear files from a <input type="file"> element by assigning an empty DataTransfer. */
    public async clearUpload (selector: any): Promise<void> {
        const selectorQuery = this._getSelectorForQuerySelector(selector);

        // Use DataTransfer to assign an empty FileList (el.value='' doesn't clear files in Chrome)
        await this.evaluateExpression(`
            (function() {
                const el = ${selectorQuery};
                if (!el) throw new Error('File input element not found');
                if (el.tagName !== 'INPUT' || el.type !== 'file')
                    throw new Error('Element is not a file input: ' + el.tagName + '[type=' + el.type + ']');
                const dt = new DataTransfer();
                el.files = dt.files;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            })()
        `);
    }

    // Extract the CSS string from a compiled Selector object (for DOM.querySelector)
    private _extractCssFromSelector (selector: any): string {
        if (typeof selector === 'string')
            return selector;

        if (selector.apiFnChain && selector.apiFnChain.length > 0) {
            const chainEntry = selector.apiFnChain[0];
            const cssMatch   = chainEntry.match(/Selector\s*\(\s*'((?:[^'\\]|\\.)*)'\s*\)/)
                || chainEntry.match(/Selector\s*\(\s*"((?:[^"\\]|\\.)*)"\s*\)/);

            if (cssMatch)
                return cssMatch[1];
        }

        throw new Error('setFilesToUpload: could not extract CSS selector from Selector object. Use a plain CSS string.');
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

        return plugin.openedBrowsers[this.parentTestRun.browserConnection.id].browserClient._getBrowserLevelClient();
    }

    // =====================================================================
    // Iframe support
    // =====================================================================

    /** Switch the eval/command context into an iframe via CDP DOM.describeNode + Page.createIsolatedWorld. */
    public async switchToIframe (selector: any): Promise<void> {
        const selectorQuery = this._getSelectorForQuerySelector(selector);

        // Verify the element is an iframe
        await this.evaluateExpression(`
            (function() {
                const el = ${selectorQuery};
                if (!el) throw new Error('Iframe element not found');
                if (el.tagName !== 'IFRAME' && el.tagName !== 'FRAME')
                    throw new Error('Element is not an iframe: ' + el.tagName);
            })()
        `);

        // Use DOM domain to find the iframe node and its frameId
        await (this._cdpClient as any).DOM.enable();

        const { root } = await (this._cdpClient as any).DOM.getDocument({ depth: 0 });

        const cssSelector     = this._extractCssFromSelectorQuery(selectorQuery);
        const { nodeId }      = await (this._cdpClient as any).DOM.querySelector({ nodeId: root.nodeId, selector: cssSelector });

        if (!nodeId)
            throw new Error(`Could not find iframe node via DOM.querySelector: ${cssSelector}`);

        const { node } = await (this._cdpClient as any).DOM.describeNode({ nodeId });
        const frameId  = node.frameId;

        if (!frameId)
            throw new Error('Could not determine frameId for the iframe element');

        // Create an isolated world in the iframe's frame — gives us a contextId
        // that targets the iframe's document
        const { executionContextId } = await (this._cdpClient as any).Page.createIsolatedWorld({
            frameId,
            worldName:           'testcafe-isolated-iframe',
            grantUniveralAccess: true,
        });

        this._currentContextId = executionContextId;

        await (this._cdpClient as any).DOM.disable();
    }

    // Switch back to the main frame's evaluation context
    public async switchToMainWindow (): Promise<void> {
        this._currentContextId = void 0;
    }

    // Extract raw CSS selector string from a "document.querySelector(...)" expression
    private _extractCssFromSelectorQuery (selectorQuery: string): string {
        const match = selectorQuery.match(/document\.querySelector\(["'](.+?)["']\)/);

        if (match) return match[1];

        // IIFE with querySelectorAll (chained selector) — extract base CSS
        const qsaMatch = selectorQuery.match(/document\.querySelectorAll\(["'](.+?)["']\)/);

        if (qsaMatch) return qsaMatch[1];

        return '';
    }

    // =====================================================================
    // HTTP Auth
    // =====================================================================

    // Set HTTP basic auth headers for the isolated session
    public async setHttpAuth (username: string, password: string): Promise<void> {
        const encoded = Buffer.from(`${username}:${password}`).toString('base64');

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

    // Convert a TestCafe compiled selector to a JS expression that returns a DOM element
    private _getSelectorForQuerySelector (selector: any): string {
        if (!selector)
            return 'document.activeElement';

        // Raw CSS string
        if (typeof selector === 'string')
            return `document.querySelector(${JSON.stringify(selector)})`;

        // TestCafe compiled selector with apiFnChain
        if (selector.apiFnChain && selector.apiFnChain.length > 0) {
            const chainEntry = selector.apiFnChain[0];
            const cssMatch = chainEntry.match(/Selector\s*\(\s*'((?:[^'\\]|\\.)*)'\s*\)/)
                || chainEntry.match(/Selector\s*\(\s*"((?:[^"\\]|\\.)*)"\s*\)/);

            if (!cssMatch) {
                if (chainEntry.includes('[function]')) {
                    throw new Error(
                        'Isolated sessions only support CSS string selectors. ' +
                        `Function-form selector not supported: ${chainEntry}`
                    );
                }

                throw new Error(
                    'Isolated sessions only support CSS string selectors. ' +
                    `Cannot parse selector: ${chainEntry}`
                );
            }

            const baseCss = cssMatch[1];

            // Simple CSS-only selector (no chaining) — fast path
            if (selector.apiFnChain.length === 1)
                return `document.querySelector(${JSON.stringify(baseCss)})`;

            // Chained selector — compile to JS IIFE
            const steps: string[] = [];

            for (let i = 1; i < selector.apiFnChain.length; i++) {
                const parsed = this._parseChainMethod(selector.apiFnChain[i]);

                steps.push(this._chainStepToJS(parsed));
            }

            return `(function() { var nodes = Array.from(document.querySelectorAll(${JSON.stringify(baseCss)})); ${steps.join(' ')} return nodes[0] || null; })()`;
        }

        // Fallback: try .value property
        if (selector.value && typeof selector.value === 'string') {
            const match = selector.value.match(/Selector\s*\(\s*['"]([^'"]+)['"]\s*\)/);

            if (match)
                return `document.querySelector(${JSON.stringify(match[1])})`;
        }

        // Fallback: fnArgs
        if (selector.fnArgs && selector.fnArgs[0] && typeof selector.fnArgs[0] === 'string')
            return `document.querySelector(${JSON.stringify(selector.fnArgs[0])})`;

        return 'document.activeElement';
    }

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

            // Single-quoted string
            const strMatch = remaining.match(/^'((?:[^'\\]|\\.)*)'/);

            if (strMatch) {
                args.push({ type: IsolatedSession._PARSED_ARG_STRING, value: strMatch[1].replace(/\\'/g, "'") });
                remaining = remaining.slice(strMatch[0].length).trim();
                continue;
            }

            // Regex literal
            const reMatch = remaining.match(/^\/((?:[^/\\]|\\.)*)\/([gimsuy]*)/);

            if (reMatch) {
                args.push({ type: IsolatedSession._PARSED_ARG_REGEX, source: reMatch[1], flags: reMatch[2] });
                remaining = remaining.slice(reMatch[0].length).trim();
                continue;
            }

            // Number
            const numMatch = remaining.match(/^(-?\d+(?:\.\d+)?)/);

            if (numMatch) {
                args.push({ type: IsolatedSession._PARSED_ARG_NUMBER, value: Number(numMatch[1]) });
                remaining = remaining.slice(numMatch[0].length).trim();
                continue;
            }

            // Function marker
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

        // No argument: collect all related nodes
        if (!arg) {
            return `nodes = (function(arr) { ${collectFn}` +
                ` var r=[]; for(var i=0;i<arr.length;i++){var rel=_c(arr[i]); for(var j=0;j<rel.length;j++){if(r.indexOf(rel[j])===-1)r.push(rel[j]);}}` +
                ` return r; })(nodes);`;
        }

        // Number argument: pick by index from each node's related list
        if (argType === IsolatedSession._PARSED_ARG_NUMBER) {
            const idx = arg.value;

            return `nodes = (function(arr) { ${collectFn}` +
                ` var r=[]; for(var i=0;i<arr.length;i++){var rel=_c(arr[i]);` +
                ` var el=${idx}<0?rel[rel.length+(${idx})]:rel[${idx}];` +
                ` if(el&&r.indexOf(el)===-1)r.push(el);}` +
                ` return r; })(nodes);`;
        }

        // String argument: filter related nodes by CSS match
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
        // Name-only check
        if (!valueArg) {
            if (nameArg.type === IsolatedSession._PARSED_ARG_STRING)
                return `nodes = nodes.filter(function(el) { return el.nodeType === 1 && el.hasAttribute('${this._escJS(nameArg.value)}'); });`;

            if (nameArg.type === IsolatedSession._PARSED_ARG_REGEX)
                return `nodes = nodes.filter(function(el) { if(el.nodeType!==1)return false; for(var i=0;i<el.attributes.length;i++){if(/${nameArg.source}/${nameArg.flags}.test(el.attributes[i].nodeName))return true;} return false; });`;

            throw new Error(`withAttribute: unsupported name argument type: ${nameArg.type}`);
        }

        // Name + value check
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

    private async _getCookies (externalCookies: any[] = [], urls: string[] = []): Promise<any[]> {
        const { cookies } = await this._cdpClient.Storage.getCookies({});

        if (!externalCookies.length && !urls.length)
            return cookies.map(this._cdpCookieToExternal);

        return cookies
            .filter(cookie => {
                if (!externalCookies.length)
                    return true;

                return externalCookies.some(filter => {
                    if (filter.name && filter.name !== cookie.name)
                        return false;

                    if (filter.domain && filter.domain !== cookie.domain)
                        return false;

                    if (filter.path && filter.path !== cookie.path)
                        return false;

                    return true;
                });
            })
            .map(this._cdpCookieToExternal);
    }

    private async _setCookies (cookies: any[], url: string): Promise<void> {
        const { hostname = '', pathname = '/' } = url ? new URL(url) : {};
        const cookieParams = Array.isArray(cookies) ? cookies : [cookies];

        await this._cdpClient.Network.setCookies({
            cookies: cookieParams.map(cookie => ({
                name:     cookie.name,
                value:    cookie.value,
                domain:   cookie.domain ?? hostname,
                path:     cookie.path ?? pathname,
                secure:   cookie.secure,
                httpOnly: cookie.httpOnly,
                sameSite: cookie.sameSite,
                expires:  cookie.expires?.getTime?.() || 8640000000000000,
            })),
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private async _deleteCookies (cookies: any[] = [], urls: string[] = []): Promise<void> {
        if (!cookies || !cookies.length)
            return this._cdpClient.Network.clearBrowserCookies();

        const { cookies: existing } = await this._cdpClient.Storage.getCookies({});

        for (const cookie of existing) {
            const shouldDelete = cookies.some(filter => {
                if (filter.name && filter.name !== cookie.name)
                    return false;

                return true;
            });

            if (shouldDelete) {
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
            try {
                await this._setCookies(JSON.parse(stateSnapshot.cookies), '');
            }
            catch (e: any) {
                throw new Error(`Failed to apply role cookies in isolated session: ${e.message}`);
            }
        }
    }

    // =====================================================================
    // Cleanup
    // =====================================================================

    /** Dispose the isolated session: close the CDP WebSocket, then destroy the browser context. */
    public async dispose (): Promise<void> {
        if (this._disposed)
            return;

        this._disposed = true;

        // Dispose native automation pipeline
        try {
            await this.nativeAutomation.dispose();
        }
        catch (e) {
            // Swallow errors during cleanup
        }

        // Dispose the browser context via the provider
        try {
            const plugin = this.parentTestRun.browserConnection.provider.plugin;

            await plugin.disposeIsolatedSession(
                this.parentTestRun.browserConnection.id,
                this.browserContextId
            );
        }
        catch (e) {
            // Swallow errors during cleanup
        }
    }
}
