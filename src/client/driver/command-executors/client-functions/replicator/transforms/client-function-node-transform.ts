import { Transform } from 'replicator';
import { DomNodeClientFunctionResultError } from '../../../../../../shared/errors/index';
// @ts-ignore
import { nativeMethods } from '../../../../deps/hammerhead';

export default class ClientFunctionNodeTransform implements Transform {
    public readonly type = 'Node';
    private readonly _instantiationCallsiteName: string;

    public constructor (instantiationCallsiteName: string) {
        this._instantiationCallsiteName = instantiationCallsiteName;
    }

    public shouldTransform (type: string, val: unknown): boolean {
        if (val instanceof nativeMethods.Node)
            throw new DomNodeClientFunctionResultError(this._instantiationCallsiteName);

        return false;
    }

    public toSerializable (): void { // eslint-disable-line @typescript-eslint/no-empty-function
    }

    public fromSerializable (): void { // eslint-disable-line @typescript-eslint/no-empty-function
    }
}
