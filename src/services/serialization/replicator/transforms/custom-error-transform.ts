import BaseTransform from './base-transform';

export default class CustomErrorTransform extends BaseTransform {
    public constructor () {
        super('CustomError');
    }

    private _isBuiltInError (type: string): boolean {
        // @ts-ignore
        return !!global[type];
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        // @ts-ignore
        return val instanceof Error && (val.isTestCafeError || !this._isBuiltInError(val.name));
    }

    public toSerializable (err: Error): Error {
        const errorData = Object.assign({}, err);

        errorData.name    = errorData.name || err.name;
        errorData.message = errorData.message || err.message;
        errorData.stack   = errorData.stack || err.stack;

        return errorData;
    }
}
