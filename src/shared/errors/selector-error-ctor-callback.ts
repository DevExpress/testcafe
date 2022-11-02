import { AutomationErrorCtor } from '../types';
import { SelectorErrorParams, SelectorErrorCb } from '../../client/driver/command-executors/client-functions/types';
import * as Errors from './index';

export function getInvisibleErrorCtor (elementName?: string): AutomationErrorCtor | string {
    return !elementName ? 'ActionElementIsInvisibleError' : {
        name:     'ActionAdditionalElementIsInvisibleError',
        firstArg: elementName,
    };
}

export function getNotFoundErrorCtor (elementName?: string): AutomationErrorCtor | string {
    return !elementName ? 'ActionElementNotFoundError' : {
        name:     'ActionAdditionalElementNotFoundError',
        firstArg: elementName,
    };
}

export function getCannotObtainInfoErrorCtor (): AutomationErrorCtor | string {
    return 'CannotObtainInfoForElementSpecifiedBySelectorError';
}

export default function createErrorCtorCallback (errCtor: AutomationErrorCtor | string): SelectorErrorCb {
    // @ts-ignore
    const Error    = typeof errCtor === 'string' ? Errors[errCtor] : Errors[errCtor.name];
    const firstArg = typeof errCtor === 'string' ? null : errCtor.firstArg;

    return (fn: SelectorErrorParams | null) => new Error(firstArg, fn);
}
