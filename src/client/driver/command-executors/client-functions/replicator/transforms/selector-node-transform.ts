import { Transform } from 'replicator';
import { CustomDOMProperties } from '../../types';
import { ElementSnapshot, NodeSnapshot } from '../../selector-executor/node-snapshots';
import { UncaughtErrorInCustomDOMPropertyCode } from '../../../../../../shared/errors/index';
// @ts-ignore
import { nativeMethods } from '../../../../deps/hammerhead';

export default class SelectorNodeTransform implements Transform {
    public readonly type = 'Node';
    private readonly _customDOMProperties: CustomDOMProperties;
    private readonly _instantiationCallsiteName: string;

    public constructor (customDOMProperties: CustomDOMProperties = {}, instantiationCallsiteName: string) {
        this._customDOMProperties       = customDOMProperties;
        this._instantiationCallsiteName = instantiationCallsiteName;
    }

    private _extend (snapshot: NodeSnapshot | ElementSnapshot, node: Node): void {
        const props = nativeMethods.objectKeys(this._customDOMProperties);

        for (const prop of props) {
            try {
                snapshot[prop] = this._customDOMProperties[prop](node);
            }
            catch (err) {
                throw new UncaughtErrorInCustomDOMPropertyCode(this._instantiationCallsiteName, err, prop);
            }
        }
    }

    public shouldTransform (type: string, val: unknown): boolean {
        return val instanceof nativeMethods.Node;
    }

    public toSerializable (node: Element): NodeSnapshot | ElementSnapshot {
        const snapshot = node.nodeType === 1 ? new ElementSnapshot(node) : new NodeSnapshot(node);

        this._extend(snapshot, node);

        return snapshot;
    }

    public fromSerializable (): void { // eslint-disable-line no-empty-function
    }
}
