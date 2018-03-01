import { assertType, is } from '../../errors/runtime/type-assertions';

export default function assertRequestHookType (hooks) {
    hooks.forEach(hook => assertType(is.requestHookSubclass, 'requestHooks', `Hook`, hook));
}
