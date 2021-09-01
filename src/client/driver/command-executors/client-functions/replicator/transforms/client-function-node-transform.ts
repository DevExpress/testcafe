import { Transform } from 'replicator';
import adapter from '../../adapter/index';
import { DomNodeClientFunctionResultError } from '../../../../../../shared/errors/index';

export default class ClientFunctionNodeTransform implements Transform {
    public readonly type = 'Node';
    private readonly _instantiationCallsiteName: string;

    public constructor (instantiationCallsiteName: string) {
        this._instantiationCallsiteName = instantiationCallsiteName;
    }

    public shouldTransform (type: string, val: unknown): boolean {
        if (val instanceof adapter.nativeMethods.Node)
            throw new DomNodeClientFunctionResultError(this._instantiationCallsiteName);

        return false;
    }

    public toSerializable (): void {
    }

    public fromSerializable (): void {
    }
}
