export default class ChildWindowClosedBeforeSwitchingError extends Error {
    constructor () {
        super();

        // NOTE: https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, ChildWindowClosedBeforeSwitchingError.prototype); //eslint-disable-line no-restricted-globals
    }
}
