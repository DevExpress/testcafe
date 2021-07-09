import BaseTransform from '../base-transform';
import { PromiseMarker, promiseMarkerSymbol } from './marker';

export default class PromiseMarkerTransform extends BaseTransform {
    public constructor () {
        super('PromiseMarker');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof PromiseMarker;
    }

    public fromSerializable (): unknown {
        return promiseMarkerSymbol;
    }
}
