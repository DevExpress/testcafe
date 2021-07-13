export interface NativeMethods {
    Function: typeof Function;
    Node: typeof Node;
    objectKeys: ObjectConstructor['keys'];
    Promise: typeof Promise;
}

export abstract class CommandExecutorsAdapterBase {
    abstract isProxyless(): boolean;
    abstract getNativeMethods(): NativeMethods;
    abstract getPromiseCtor (): typeof Promise;
}
