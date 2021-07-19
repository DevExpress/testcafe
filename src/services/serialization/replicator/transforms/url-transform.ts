import BaseTransform from './base-transform';

export default class URLTransform extends BaseTransform {
    public constructor () {
        super('URL');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof URL;
    }

    public toSerializable (value: URL): string {
        return value.toString();
    }

    public fromSerializable (value: string): URL {
        return new URL(value);
    }
}
