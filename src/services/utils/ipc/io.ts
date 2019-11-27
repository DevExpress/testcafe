import fs from 'fs';
import Packet from './packet';
import { MessageParser, MessageSerializer } from './message';
import EventEmitter from '../../../../src/utils/async-event-emitter';


export class AsyncReader extends EventEmitter {
    private readonly parser: MessageParser;
    private readonly stream: NodeJS.ReadableStream;
    private readonly messageIterator: AsyncGenerator<void, void, object[]>;

    public constructor (stream: NodeJS.ReadableStream) {
        super();

        this.parser = new MessageParser();
        this.stream = stream;

        this.messageIterator = this._iterateMessages();
    }

    private _onData (data: Buffer): void {
        const messages = this.parser.parse(data);

        if (!messages.length)
            return;

        this.messageIterator.next(messages);
    }

    private async * _iterateMessages (): AsyncGenerator<void, void, object[]> {
        while (true) {
            const messages = yield;

            for (const message of messages)
                await this.emit('data', message);
        }
    }

    public read (): void {
        this.messageIterator.next();

        this.stream.on('data', data => this._onData(data));
    }
}

export class AsyncWriter {
    private readonly serializer: MessageSerializer;
    private readonly stream: NodeJS.WritableStream;

    private batchPromise: Promise<void>;

    public constructor (stream: NodeJS.WritableStream) {
        this.serializer = new MessageSerializer();
        this.stream     = stream;

        this.batchPromise = Promise.resolve();
    }

    private _write (buffer: Buffer): Promise<void> {
        if (this.stream.write(buffer))
            return Promise.resolve();

        return new Promise(r => this.stream.on('drain', r));
    }

    private _writeBuffers (buffers: Buffer[]): Promise<void> {
        this.batchPromise = this.batchPromise
            .catch(() => {})
            .then(async () => {
                for (const buffer of buffers)
                    await this._write(buffer);
            });

        return this.batchPromise;
    }

    public async write (message: object): Promise<void> {
        const buffers = this.serializer.serialize(message);

        return await this._writeBuffers(buffers);
    }
}

export class SyncReader {
    private readonly parser: MessageParser;
    private readonly fd: number;
    private readonly messageQueue: object[];

    public constructor (fd: number) {
        this.parser = new MessageParser();
        this.fd     = fd;

        this.messageQueue = [];
    }

    private _readSync (): Buffer {
        const buffer     = Buffer.alloc(Packet.MAX_MESSAGE_SIZE);
        const readLength = fs.readSync(this.fd, buffer, 0, Packet.MAX_MESSAGE_SIZE, null);

        return buffer.slice(0, readLength);
    }

    private _addMessagesToQueue (): void {
        let messages = this.parser.parse(this._readSync());

        while (!messages.length)
            messages = this.parser.parse(this._readSync());

        this.messageQueue.push(...messages);
    }

    public readSync (): object {
        let message = this.messageQueue.shift();

        while (!message) {
            this._addMessagesToQueue();

            message = this.messageQueue.shift();
        }

        return message;
    }
}

export class SyncWriter {
    private readonly serializer: MessageSerializer;
    private readonly fd: number;

    public constructor (fd: number) {
        this.serializer = new MessageSerializer();
        this.fd         = fd;
    }

    private _writeSync (buffer: Buffer): void {
        fs.writeSync(this.fd, buffer);
    }

    public writeSync (message: object): void {
        const buffers = this.serializer.serialize(message);

        for (const buffer of buffers)
            this._writeSync(buffer);
    }
}
