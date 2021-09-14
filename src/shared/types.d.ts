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

interface ClientReqEmitter<R> {
    onReqSend: (fn: (req: R) => void) => void;
    onReqCompleted: (fn: (req: R) => void) => void;
    onReqError: (fn: (req: R) => void) => void;
    offAll: () => void;
}
