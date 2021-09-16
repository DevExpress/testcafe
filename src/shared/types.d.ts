/* global globalThis */

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
    nativeMethods: NativeMethods;
    PromiseCtor: typeof Promise;
}

interface ClientRequestEmitter<R> {
    onRequestSend: (fn: (req: R) => void) => void;
    onRequestCompleted: (fn: (req: R) => void) => void;
    onRequestError: (fn: (req: R) => void) => void;
    offAll: () => void;
}

interface ScriptExecutionEmitter<S> {
    onScriptAdded: (fn: (scr: S) => void) => void;
    onScriptLoadedOrFailed: (fn: (scr: S) => void) => void;
    offAll: () => void;
}
