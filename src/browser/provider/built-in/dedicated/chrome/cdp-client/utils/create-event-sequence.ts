import { ServerNode } from '../types';
import * as clientsManager from '../clients-manager';

interface ChromeCdpEventSequenceEventOptions {
    clientX: number;
    clientY: number;
}

class ChromeCdpEventSequence {
    public async run (currentElement: ServerNode, prevElement: ServerNode, options: ChromeCdpEventSequenceEventOptions): Promise<void> {
        const { Input } = clientsManager.getClient();

        await Input.dispatchMouseEvent({
            type: 'mouseMoved',
            x:    options.clientX,
            y:    options.clientY,
        });
    }
}

export default function createEventSequence (): ChromeCdpEventSequence {
    return new ChromeCdpEventSequence();
}
