import BaseTransform from './base-transform';
import { ConfigureResponseEventOptions } from 'testcafe-hammerhead';

interface SerializedConfigureResponseEventOptions {
    _includeHeaders: boolean;
    _includeBody: boolean;
}

export default class ConfigureResponseEventOptionTransform extends BaseTransform {
    public constructor () {
        super('ConfigureResponseEventOption');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof ConfigureResponseEventOptions;
    }

    public fromSerializable (value: SerializedConfigureResponseEventOptions): ConfigureResponseEventOptions {
        return new ConfigureResponseEventOptions(value._includeHeaders, value._includeBody);
    }
}
