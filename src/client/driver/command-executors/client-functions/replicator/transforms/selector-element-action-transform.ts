import { Transform } from 'replicator';
import adapter from '../../adapter/index';
import { ElementActionSnapshot } from '../../selector-executor/node-snapshots';

export default class SelectorElementActionTransform implements Transform {
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
