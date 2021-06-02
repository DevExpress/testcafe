import Replicator, { Transform } from 'replicator';
import evalFunction from './eval-function';
import { DomNodeClientFunctionResultError } from '../../shared/errors';
import { ExecuteClientFunctionCommandBase } from '../../test-run/commands/observation';

const identity = (val: unknown): unknown => val;


export function createReplicator (transforms: Transform[]): Replicator {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    const replicator = new Replicator({
        serialize:   identity,
        deserialize: identity
    });

    return replicator.addTransforms(transforms);
}

export class FunctionTransform {
    public readonly type = 'Function';

    public shouldTransform (type: string): boolean {
        return type === 'function';
    }

    public toSerializable (): string {
        return '';
    }

    // HACK: UglifyJS + TypeScript + argument destructuring can generate incorrect code.
    // So we have to use plain assignments here.
    public fromSerializable (opts: ExecuteClientFunctionCommandBase): Function {
        const fnCode       = opts.fnCode;
        const dependencies = opts.dependencies;

        return evalFunction(fnCode, dependencies);
    }
}

export class ClientFunctionNodeTransform {
    public readonly type = 'Node';
    public readonly instantiationCallsiteName: string;

    public constructor (instantiationCallsiteName: string) {
        this.instantiationCallsiteName = instantiationCallsiteName;
    }

    public shouldTransform (type: string, val: any): boolean {
        if (val instanceof Node)
            throw DomNodeClientFunctionResultError.name;

        return false;
    }

    public toSerializable (): void {
    }

    public fromSerializable (): void {
    }
}
