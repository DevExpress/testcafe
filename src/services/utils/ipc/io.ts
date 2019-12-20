import fs from 'fs';
import debug from 'debug';
import Packet from './packet';
import { MessageParser, MessageSerializer } from './message';
import EventEmitter from '../../../utils/async-event-emitter';


const debugLogger = debug('testcafe:services:utils:ipc:io');

export class AsyncReader extends EventEmitter {
    private readonly parser: MessageParser;
    private readonly stream: NodeJS.ReadableStream;
    private processMessages: Promise<void>;

    public constructor (stream: NodeJS.ReadableStream) {
        super();

        this.parser = new MessageParser();
        this.stream = stream;

        this.processMessages = Promise.resolve();
    }

    private _onData (data: Buffer): void {
        const messages = this.parser.parse(data);

        if (!messages.length)
            return;

        this.processMessages = this.processMessages.then(() => this._processMessages(messages));
    }

    private async _processMessages (messages: object[]): Promise<void> {
        for (const message of messages) {
            try {
                await this.emit('data', message);
            }
            catch (e) {
                debugLogger(e);
            }
        }
    }

    public read (): void {
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

        return new Promise(r => this.stream.once('drain', r));
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
        const buffer     = Buffer.alloc(Packet.MAX_PACKET_SIZE);
        const readLength = fs.readSync(this.fd, buffer, 0, Packet.MAX_PACKET_SIZE, null);

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
