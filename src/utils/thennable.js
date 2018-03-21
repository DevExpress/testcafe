export function isThennable (target) {
    return target && typeof target === 'object' && 'then' in target && typeof target.then === 'function';
}
