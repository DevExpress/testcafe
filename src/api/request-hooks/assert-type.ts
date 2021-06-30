import { assertType, is } from '../../errors/runtime/type-assertions';
import RequestHook from './hook';

export default function assertRequestHookType (hooks: RequestHook[]): void {
    hooks.forEach(hook => assertType(is.requestHookSubclass, 'requestHooks', 'The hook', hook));
}
