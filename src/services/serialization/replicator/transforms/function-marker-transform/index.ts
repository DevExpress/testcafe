import BaseTransform from '../base-transform';
import { FunctionMarker, functionMarkerSymbol } from './marker';

export default class FunctionMarkerTransform extends BaseTransform {
    public constructor () {
        super('FunctionMarker');
    }

    public shouldTransform (_: unknown, val: unknown): boolean {
        return val instanceof FunctionMarker;
    }

    public fromSerializable (): unknown {
        return functionMarkerSymbol;
    }
}
