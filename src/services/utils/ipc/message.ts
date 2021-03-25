import { default as Packet, ParsedPacket } from './packet';
import { GeneralError } from '../../../errors/runtime';
import { RUNTIME_ERRORS } from '../../../errors/types';
import createReplicator from '../../serialization/replicator/create-replicator';

const replicator = createReplicator();

export class MessageParser {
    private readonly dataQueue: Buffer[];
    private readonly packetQueue: ParsedPacket[];

    public constructor () {
        this.dataQueue   = [];
        this.packetQueue = [];
    }

    private static _concatPackets (packets: ParsedPacket[]): Buffer {
        const data = packets.map(packet => packet.data);

        return Buffer.concat(data);
    }

    private _processPacket (packet: ParsedPacket): object|undefined {
        if (packet.header.tail) {
            if (!packet.header.head && this.packetQueue.length === 0)
                throw new GeneralError(RUNTIME_ERRORS.unexpectedIPCTailPacket);

            const packets = this.packetQueue.splice(0, this.packetQueue.length);
            const data    = packet.header.head ? packet.data : MessageParser._concatPackets([...packets, packet]);

            return replicator.decode(data.toString()) as object;
        }

        if (packet.header.head && this.packetQueue.length !== 0) {
            this.packetQueue.splice(0, this.packetQueue.length);

            throw new GeneralError(RUNTIME_ERRORS.unexpectedIPCHeadPacket);
        }

        if (!packet.header.head && !packet.header.tail && this.packetQueue.length === 0)
            throw new GeneralError(RUNTIME_ERRORS.unexpectedIPCBodyPacket);

        this.packetQueue.push(packet);

        return void 0;
    }

    private _processData (): object[] {
        let buffer = Buffer.concat(this.dataQueue.splice(0, this.dataQueue.length));
        let packet = Packet.parse(buffer);

        const messages = [];

        while (packet) {
            const message = this._processPacket(packet);

            if (message)
                messages.push(message);

            buffer = buffer.slice(packet.header.totalSize);

            packet = Packet.parse(buffer);
        }

        if (buffer.length)
            this.dataQueue.unshift(buffer);

        return messages;
    }

    public parse (data: Buffer): object[] {
        this.dataQueue.push(data);

        return this._processData();
    }
}

export class MessageSerializer {
    private static _chunkData (data: Buffer): Buffer[] {
        const chunks = [];

        for (let index = 0; index < data.length; index += Packet.MAX_PAYLOAD_SIZE) {
            const size = Math.min(data.length - index, Packet.MAX_PAYLOAD_SIZE);
            const head = index === 0;
            const tail = index + size >= data.length;

            chunks.push(Packet.serialize(data.slice(index, index + size), { head, tail }));
        }

        return chunks;
    }

    public serialize (message: object): Buffer[] {
        const encodedMessage = replicator.encode(message);

        return MessageSerializer._chunkData(Buffer.from(encodedMessage));
    }
}
