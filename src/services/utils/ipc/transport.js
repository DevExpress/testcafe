import fs from 'fs';
import EventEmitter from '../../../../lib/utils/async-event-emitter';

const HEAD_MASK = 0x01;
const TAIL_MASK = 0x02;

const BYTE_SHIFT = 8;
const BYTE_MASK  = 2 ** BYTE_SHIFT - 1;

const MAX_MESSAGE_SIZE = 64 * 2 ** 10;
const HEADER_SIZE      = 4;
const MAX_PAYLOAD_SIZE = MAX_MESSAGE_SIZE - HEADER_SIZE;

const UNEXPECTED_MESSAGE_TAIL = 'Unexpected message tail';
const UNEXPECTED_MESSAGE_BODY = 'Unexpected message body';
const UNEXPECTED_MESSAGE_HEAD = 'Unexpected message head';
const TOO_LARGE_PAYLOAD       = 'Payload is too large';

function error (msg) {
    throw new Error(msg);
}

class PacketFormat {
    static _parseHeader (buffer) {
        const dataSize = ((buffer[1] << BYTE_SHIFT) << BYTE_SHIFT) | (buffer[2] << BYTE_SHIFT) | buffer[3];

        return {
            head:      buffer[0] & HEAD_MASK,
            tail:      buffer[0] & TAIL_MASK,
            size:      dataSize,
            totalSize: dataSize + HEADER_SIZE
        };
    }

    static parse (buffer) {
        if (buffer.length < HEADER_SIZE)
            return void 0;

        const header = PacketFormat._parseHeader(buffer);

        if (buffer.length < header.size)
            return void 0;

        return { header, data: data.slice(HEADER_SIZE, HEADER_SIZE + header.size) };
    }

    static _serializeHeader ({ size, head, tail }, buffer) {
        buffer[0] = 0;

        if (head)
            buffer[0] |= HEAD_MASK;

        if (tail)
            buffer[0] |= TAIL_MASK;

        buffer[1] = ((size >> BYTE_SHIFT) >> BYTE_SHIFT) & BYTE_MASK;
        buffer[2] = (size >> BYTE_SHIFT) & BYTE_MASK;
        buffer[3] = size & BYTE_MASK;
    }

    static serialize (data, { head, tail }) {
        const size = data.length;

        if (size > MAX_PAYLOAD_SIZE)
            error(TOO_LARGE_PAYLOAD);

        const buffer = Buffer.alloc(size + HEADER_SIZE);

        PacketFormat._serializeHeader({ size, head, tail }, buffer);

        data.copy(buffer, HEADER_SIZE);

        return buffer;
    }
}

class Parser {
    constructor () {
        this.dataQueue   = [];
        this.packetQueue = [];
    }

    static _concatPackets (packets) {
        const data = packets.map(packet => packet.data);

        return Buffer.concat(data);
    }

    _processPacket (packet) {
        if (packet.header.tail) {
            if (!packet.header.head && this.packetQueue.length === 0)
                error(UNEXPECTED_MESSAGE_TAIL);

            const packets = this.packetQueue.slice(0, this.packetQueue.length);
            const data    = packet.header.head ? packet.data : Parser._concatPackets([...packets, packet]);

            return JSON.parse(data);
        }

        if (packet.header.head && this.packetQueue.length !== 0) {
            this.packetQueue.slice(0, this.packetQueue.length);

            error(UNEXPECTED_MESSAGE_HEAD);
        }

        if (!packet.header.head && !packet.header.tail && this.packetQueue.length === 0)
            error(UNEXPECTED_MESSAGE_BODY);

        this.packetQueue.push(packet);

        return void 0;
    }

    _processData () {
        let buffer = Buffer.concat(this.dataQueue.splice(0, this.dataQueue.length));
        let packet = PacketFormat.parse(buffer);

        const messages = [];

        while (packet) {
            const message = this._processPacket(packet);

            if (message)
                messages.push(message);

            buffer = buffer.slice(packet.header.totalSize);

            packet = PacketFormat.parse(buffer);
        }

        if (buffer.length)
            this.dataQueue.unshift(buffer);

        return messages;
    }

    parse (data) {
        this.dataQueue.push(data);

        return this._processData();
    }
}

class Serializer {
    static _chunkData (data) {
        const chunks = [];

        for (let index = 0; index < data.length; index += MAX_PAYLOAD_SIZE) {
            const size = Math.min(data.length - index, MAX_PAYLOAD_SIZE);
            const head = index === 0;
            const tail = index + size >= data.length;

            chunks.push(PacketFormat.serialize(data.slice(index, index + size), { head, tail }));
        }

        return chunks;
    }

    serialize (message) {
        return Serializer._chunkData(Buffer.from(JSON.stringify(message)));
    }
}

class AsyncReader extends EventEmitter {
    constructor (stream) {
        super();

        this.parser = new Parser();
        this.stream = stream;
    }

    _onData (data) {
        const messages = this.parser.parse(data);

        for (const message of messages)
            this.emit('data', message);
    }

    read () {
        this.stream.on('data', data => this._onData(data));
    }
}

class AsyncWriter {
    constructor (stream) {
        this.serializer = new Serializer();
        this.stream     = stream;

        this.batchPromise = Promise.resolve();
    }

    _write (buffer) {
        if (this.stream.write(buffer))
            return Promise.resolve();

        return new Promise(r => this.stream.on('drain', r));
    }

    _writeBuffers (buffers) {
        this.batchPromise = this.batchPromise
            .catch(() => {})
            .then(async () => {
                for (const buffer of buffers)
                    await this._write(buffer);
            });

        return this.batchPromise;
    }

    async write (message) {
        const buffers = this.serializer.serialize(message);

        return await this._writeBuffers(buffers);
    }
}

class SyncReader {
    constructor (fd) {
        this.parser = new Parser();
        this.fd     = fd;

        this.messageQueue = [];
    }

    _readSync () {
        const buffer     = Buffer.alloc(MAX_MESSAGE_SIZE);
        const readLength = fs.readSync(this.fd, buffer, 0, MAX_MESSAGE_SIZE, null);

        return buffer.slice(0, readLength);
    }

    _addMessagesToQueue () {
        let messages = this.parser.parser(this._readSync());

        while (!messages.length)
            messages = this.parser.parse(this._readSync());

        this.messageQueue.push(...messages);
    }

    readSync () {
        if (!this.messageQueue.length)
            this._addMessagesToQueue();

        return this.messageQueue.shift();
    }
}

class SyncWriter {
    constructor (fd) {
        this.serializer = new Serializer();
        this.fd         = fd;
    }

    _writeSync (buffer) {
        fs.writeSync(this.fd, buffer);
    }

    writeSync (message) {
        const buffers = this.serializer.serialize(message);

        for (const buffer of buffers)
            this._writeSync(buffer);
    }

}

export class HostTransport extends EventEmitter {
    constructor (inputStream, outputStream, syncStream) {
        super();

        this.asyncReader = new AsyncReader(inputStream);
        this.asyncWriter = new AsyncWriter(outputStream);

        this.syncReader = new AsyncReader(syncStream);
        this.syncWriter = new AsyncWriter(syncStream);

        this.readers = [this.asyncReader, this.syncReader];
    }

    read () {
        this.readers.forEach(reader => reader.on('data', data => this.emit('data', data)));
    }

    async write (message) {
        const writer = message.sync ? this.syncWriter : this.asyncWriter;

        await writer.write(message);
    }

    readSync () {

    }

    writeSync () {

    }
}


export class ServiceTransport extends EventEmitter {
    constructor (inputStream, outputStream, syncFd) {
        super();

        this.asyncReader = new AsyncReader(inputStream);
        this.asyncWriter = new AsyncWriter(outputStream);

        this.syncReader = new SyncReader(syncFd);
        this.syncWriter = new SyncWriter(syncFd);
    }

    read () {
        this.asyncReader.on('data', data => this.emit('data', data));
    }

    async write (message) {
        await this.asyncWriter.write(message);
    }

    readSync () {
        return this.syncReader.readSync();
    }

    writeSync () {
        this.syncWriter.writeSync(message);
    }
}
