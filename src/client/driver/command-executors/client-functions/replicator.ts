import Replicator, { Transform } from 'replicator';
import evalFunction from './eval-function';
import {
    NodeSnapshot,
    ElementSnapshot,
    ElementActionSnapshot,
} from './selector-executor/node-snapshots';
import { DomNodeClientFunctionResultError, UncaughtErrorInCustomDOMPropertyCode } from '../../../../shared/errors';
import { ExecuteClientFunctionCommandBase } from '../../../../test-run/commands/observation';
import { CommandExecutorsAdapterBase } from '../../../proxyless/command-executors-adapter-base';
import { CustomDOMProperties } from './selector-executor/types';


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
    private readonly _adapter: CommandExecutorsAdapterBase;

    public constructor (adapter: CommandExecutorsAdapterBase) {
        this._adapter = adapter;
    }

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

        return evalFunction(fnCode, dependencies, this._adapter);
    }
}

export class SelectorElementActionTransform implements Transform {
    public readonly type = 'Node';
    private readonly _adapter: CommandExecutorsAdapterBase;

    public constructor (adapter: CommandExecutorsAdapterBase) {
        this._adapter = adapter;
    }

    public shouldTransform (type: string, val: unknown): boolean {
        return val instanceof this._adapter.getNativeMethods().Node;
    }

    public toSerializable (node: Node): ElementActionSnapshot {
        return new ElementActionSnapshot(node);
    }

    public fromSerializable (): void {
    }
}

export class SelectorNodeTransform implements Transform {
    public readonly type = 'Node';
    private readonly _customDOMProperties: CustomDOMProperties;
    private readonly _instantiationCallsiteName: string;
    private readonly _adapter: CommandExecutorsAdapterBase;

    public constructor (customDOMProperties: CustomDOMProperties = {}, instantiationCallsiteName: string,
        adapter: CommandExecutorsAdapterBase) {
        this._customDOMProperties       = customDOMProperties;
        this._instantiationCallsiteName = instantiationCallsiteName;
        this._adapter                   = adapter;
    }

    private _extend (snapshot: NodeSnapshot | ElementSnapshot, node: Node): void {
        const props = this._adapter.getNativeMethods().objectKeys(this._customDOMProperties);

        for (const prop of props) {
            try {
                // TODO: remove ts-ignore
                // @ts-ignore
                snapshot[prop] = this._customDOMProperties[prop](node);
            }
            catch (err) {
                throw this._adapter.isProxyless()
                    ? UncaughtErrorInCustomDOMPropertyCode.name
                    : new UncaughtErrorInCustomDOMPropertyCode(this._instantiationCallsiteName, err, prop);
            }
        }
    }

    public shouldTransform (type: string, val: unknown): boolean {
        return val instanceof this._adapter.getNativeMethods().Node;
    }

    public toSerializable (node: Node): NodeSnapshot | ElementSnapshot {
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
    private readonly _adapter: CommandExecutorsAdapterBase;

    public constructor (instantiationCallsiteName: string, adapter: CommandExecutorsAdapterBase) {
        this._instantiationCallsiteName = instantiationCallsiteName;
        this._adapter                   = adapter;
    }

    public shouldTransform (type: string, val: unknown): boolean {
        if (val instanceof Node) {
            throw this._adapter.isProxyless()
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
