import BaseTransform from '../base-transform';
import ReExecutablePromise from '../../../../../utils/re-executable-promise';
import { reExecutablePromiseMarkerSymbol } from './marker';

export default class ReExecutablePromiseTransform extends BaseTransform {
    public constructor () {
        super('ReExecutablePromise');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof ReExecutablePromise;
    }

    public fromSerializable (): unknown {
        return reExecutablePromiseMarkerSymbol;
    }
}
