/* eslint-disable no-restricted-globals */
import { CommandExecutorsAdapterBase, NativeMethods } from './command-executors-adapter-base';


export default class CommandExecutorsAdapter extends CommandExecutorsAdapterBase {
    private readonly _nativeMethods = {
        Function,
        Node,
        Promise,
        objectKeys: Object.keys,
    };

    public isProxyless (): boolean {
        return true;
    }

    public getNativeMethods (): NativeMethods {
        return this._nativeMethods;
    }

    public getPromiseCtor (): typeof Promise {
        return this._nativeMethods.Promise;
    }
}
