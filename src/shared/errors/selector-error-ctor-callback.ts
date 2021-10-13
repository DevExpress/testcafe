import { AutomationErrorCtor } from '../types';
import { FnInfo, SelectorErrorCb } from '../../client/driver/command-executors/client-functions/types';
import * as Errors from './index';


export default function createErrorCtorCallback (errCtor: AutomationErrorCtor | string): SelectorErrorCb {
    // @ts-ignore
    const Error    = typeof errCtor === 'string' ? Errors[errCtor] : Errors[errCtor.name];
    const firstArg = typeof errCtor === 'string' ? null : errCtor.firstArg;

    return (fn: FnInfo | null) => new Error(firstArg, fn);
}
