/* global globalThis */

import { ExecuteSelectorCommand } from '../test-run/commands/observation';

export interface NativeMethods {
    setTimeout: typeof globalThis.setTimeout;
    clearTimeout: typeof globalThis.clearTimeout;
    arrayIndexOf: any[]['indexOf'];
    arraySplice: any[]['splice'];
    arraySlice: any[]['slice'];
    arrayFilter: any[]['filter'];
    objectAssign: ObjectConstructor['assign'];
    objectKeys: ObjectConstructor['keys'];
    dateNow: DateConstructor['now'];
}

export interface SharedAdapter {
    automations: {
        _ensureWindowAndCursorForLegacyTests (automation: any): void;
    };
}

export interface ClientRequestEmitter<R> {
    onRequestSend: (fn: (req: R) => void) => void;
    onRequestCompleted: (fn: (req: R) => void) => void;
    onRequestError: (fn: (req: R) => void) => void;
    offAll: () => void;
}

export interface ScriptExecutionEmitter<S> {
    onScriptAdded: (fn: (scr: S) => void) => void;
    onScriptLoadedOrFailed: (fn: (scr: S) => void) => void;
    offAll: () => void;
}

interface AutomationErrorCtor {
    name: string;
    firstArg: string | null;
}

interface AutomationErrorCtors {
    notFound: AutomationErrorCtor | string;
    invisible: AutomationErrorCtor | string;
}

export type ExecuteSelectorFn<T> = (selector: ExecuteSelectorCommand, errCtors: AutomationErrorCtors, startTime: number) => Promise<T>;

export interface SharedWindow {
    parent: SharedWindow | null;
}
