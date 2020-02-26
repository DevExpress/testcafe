import { GeneralError } from '../../../errors/runtime';
import { RUNTIME_ERRORS } from '../../../errors/types';


const HEAD_MASK = 0x01;
const TAIL_MASK = 0x02;

const BYTE_SHIFT = 8;
const BYTE_MASK  = 2 ** BYTE_SHIFT - 1;

interface PacketHeaderFlags {
    head: boolean;
    tail: boolean;
}

interface PacketHeaderData extends PacketHeaderFlags {
    size: number;
}

export interface PacketHeader extends PacketHeaderData{
    totalSize: number;
}

export interface ParsedPacket {
    header: PacketHeader;
    data: Buffer;
}

export class Packet {
    // NOTE: Max message size: 64 KiB, header size: 4 B
    public static readonly MAX_PACKET_SIZE = 64 * 2 ** 10;
    public static readonly HEADER_SIZE = 4;
    public static readonly MAX_PAYLOAD_SIZE = Packet.MAX_PACKET_SIZE - Packet.HEADER_SIZE;

    private static _parseHeader (buffer: Buffer): PacketHeader {
        const dataSize = buffer[1] << BYTE_SHIFT << BYTE_SHIFT | buffer[2] << BYTE_SHIFT | buffer[3];

        return {
            head:      Boolean(buffer[0] & HEAD_MASK),
            tail:      Boolean(buffer[0] & TAIL_MASK),
            size:      dataSize,
            totalSize: dataSize + Packet.HEADER_SIZE
        };
    }

    public static parse (buffer: Buffer): ParsedPacket|undefined {
        if (buffer.length < Packet.HEADER_SIZE)
            return void 0;

        const header = Packet._parseHeader(buffer);

        if (header.size > this.MAX_PAYLOAD_SIZE)
            throw new GeneralError(RUNTIME_ERRORS.tooLargeIPCPayload);

        if (buffer.length < header.size)
            return void 0;

        return { header, data: buffer.slice(Packet.HEADER_SIZE, Packet.HEADER_SIZE + header.size) };
    }

    private static _serializeHeader ({ size, head, tail }: PacketHeaderData, buffer: Buffer): void {
        buffer[0] = 0;

        if (head)
            buffer[0] |= HEAD_MASK;

        if (tail)
            buffer[0] |= TAIL_MASK;

        buffer[1] = size >> BYTE_SHIFT >> BYTE_SHIFT & BYTE_MASK;
        buffer[2] = size >> BYTE_SHIFT & BYTE_MASK;
        buffer[3] = size & BYTE_MASK;
    }

    public static serialize (data: Buffer, { head = false, tail = false }: Partial<PacketHeaderFlags> = {}): Buffer {
        const size = data.length;

        if (size > Packet.MAX_PAYLOAD_SIZE)
            throw new GeneralError(RUNTIME_ERRORS.tooLargeIPCPayload);

        const buffer = Buffer.alloc(size + Packet.HEADER_SIZE);

        Packet._serializeHeader({ size, head, tail }, buffer);

        data.copy(buffer, Packet.HEADER_SIZE);

        return buffer;
    }
}

export default Packet;


