export function isThennable (target) {
    return typeof target === 'object' && 'then' in target && typeof target.then === 'function';
}
