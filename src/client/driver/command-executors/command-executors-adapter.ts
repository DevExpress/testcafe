// @ts-ignore
import { Promise, nativeMethods } from '../deps/hammerhead';
import { CommandExecutorsAdapterBase, NativeMethods } from '../../proxyless/command-executors-adapter-base';

export default class CommandExecutorsAdapter extends CommandExecutorsAdapterBase {
    public isProxyless (): boolean {
        return false;
    }

    public getNativeMethods (): NativeMethods {
        return nativeMethods;
    }

    public getPromiseCtor (): typeof Promise {
        return Promise;
    }
}
