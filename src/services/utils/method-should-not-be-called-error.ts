export default class MethodShouldNotBeCalledError extends Error {
    public constructor () {
        super('The method should not be called.');
    }
}
