import { ServerNode } from '../types';

interface ChromeCdpEventSequenceEventOptions {
    clientX: number;
    clientY: number;
}

class ChromeCdpEventSequence {
    public async run (currentElement: ServerNode, prevElement: ServerNode, options: ChromeCdpEventSequenceEventOptions): Promise<void> {
    }
}

export default function createEventSequence (): ChromeCdpEventSequence {
    return new ChromeCdpEventSequence();
}
