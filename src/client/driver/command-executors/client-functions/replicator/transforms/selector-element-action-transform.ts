import { Transform } from 'replicator';
import { ElementActionSnapshot } from '../../selector-executor/node-snapshots';
// @ts-ignore
import { nativeMethods } from '../../../../deps/hammerhead';


export default class SelectorElementActionTransform implements Transform {
    public readonly type = 'Node';

    public shouldTransform (type: string, val: unknown): boolean {
        return val instanceof nativeMethods.Node;
    }

    public toSerializable (node: Element): ElementActionSnapshot {
        return new ElementActionSnapshot(node);
    }

    public fromSerializable (): void { // eslint-disable-line @typescript-eslint/no-empty-function
    }
}
