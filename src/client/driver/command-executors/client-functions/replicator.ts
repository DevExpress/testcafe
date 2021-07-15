import Replicator, { Transform } from 'replicator';
import evalFunction from './eval-function';
import {
    NodeSnapshot,
    ElementSnapshot,
    ElementActionSnapshot,
} from './selector-executor/node-snapshots';
import { DomNodeClientFunctionResultError, UncaughtErrorInCustomDOMPropertyCode } from '../../../../shared/errors/index';
import { ExecuteClientFunctionCommandBase } from '../../../../test-run/commands/observation';
import { CustomDOMProperties } from './types';
import adapter from './adapter/index';


const identity = (val: unknown): unknown => val;


export function createReplicator (transforms: Transform[]): Replicator {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    const replicator = new Replicator({
        serialize:   identity,
        deserialize: identity,
    });

    return replicator.addTransforms(transforms);
}

export class FunctionTransform implements Transform {
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

export class SelectorElementActionTransform implements Transform {
    public readonly type = 'Node';

    public shouldTransform (type: string, val: unknown): boolean {
        return val instanceof adapter.nativeMethods.Node;
    }

    public toSerializable (node: Element): ElementActionSnapshot {
        return new ElementActionSnapshot(node);
    }

    public fromSerializable (): void {
    }
}

export class SelectorNodeTransform implements Transform {
    public readonly type = 'Node';
    private readonly _customDOMProperties: CustomDOMProperties;
    private readonly _instantiationCallsiteName: string;

    public constructor (customDOMProperties: CustomDOMProperties = {}, instantiationCallsiteName: string) {
        this._customDOMProperties       = customDOMProperties;
        this._instantiationCallsiteName = instantiationCallsiteName;
    }

    private _extend (snapshot: NodeSnapshot | ElementSnapshot, node: Node): void {
        const props = adapter.nativeMethods.objectKeys(this._customDOMProperties);

        for (const prop of props) {
            try {
                // TODO: remove ts-ignore
                // @ts-ignore
                snapshot[prop] = this._customDOMProperties[prop](node);
            }
            catch (err) {
                throw adapter.isProxyless
                    ? UncaughtErrorInCustomDOMPropertyCode.name
                    : new UncaughtErrorInCustomDOMPropertyCode(this._instantiationCallsiteName, err, prop);
            }
        }
    }

    public shouldTransform (type: string, val: unknown): boolean {
        return val instanceof adapter.nativeMethods.Node;
    }

    public toSerializable (node: Element): NodeSnapshot | ElementSnapshot {
        const snapshot = node.nodeType === 1 ? new ElementSnapshot(node) : new NodeSnapshot(node);

        this._extend(snapshot, node);

        return snapshot;
    }

    public fromSerializable (): void {
    }
}

export class ClientFunctionNodeTransform implements Transform {
    public readonly type = 'Node';
    private readonly _instantiationCallsiteName: string;

    public constructor (instantiationCallsiteName: string) {
        this._instantiationCallsiteName = instantiationCallsiteName;
    }

    public shouldTransform (type: string, val: unknown): boolean {
        if (val instanceof Node) {
            throw adapter.isProxyless
                ? DomNodeClientFunctionResultError.name
                : new DomNodeClientFunctionResultError(this._instantiationCallsiteName);
        }

        return false;
    }

    public toSerializable (): void {
    }

    public fromSerializable (): void {
    }
}
