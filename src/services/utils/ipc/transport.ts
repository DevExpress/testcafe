import { AsyncReader, AsyncWriter, SyncReader, SyncWriter } from './io';
import EventEmitter from '../../../utils/async-event-emitter';
import { GeneralError } from '../../../errors/runtime';
import { RUNTIME_ERRORS } from '../../../errors/types';
import { IPCPacket, IPCResponsePacket, IPCTransport, isIPCResponsePacket } from './interfaces';


export class HostTransport extends EventEmitter implements IPCTransport {
    private readonly asyncReader: AsyncReader;
    private readonly asyncWriter: AsyncWriter;
    private readonly syncReader: AsyncReader;
    private readonly syncWriter: AsyncWriter;

    private readonly readers: AsyncReader[];

    public constructor (inputStream: NodeJS.ReadableStream, outputStream: NodeJS.WritableStream, syncStream: NodeJS.ReadableStream & NodeJS.WritableStream) {
        super();

        this.asyncReader = new AsyncReader(inputStream);
        this.asyncWriter = new AsyncWriter(outputStream);

        this.syncReader = new AsyncReader(syncStream);
        this.syncWriter = new AsyncWriter(syncStream);

        this.readers = [this.asyncReader, this.syncReader];
    }

    public read (): void {
        this.readers.forEach(reader => {
            reader.on('data', data => this.emit('data', data));
            reader.read();
        });
    }

    public async write (message: IPCPacket): Promise<void> {
        const writer = message.sync ? this.syncWriter : this.asyncWriter;

        await writer.write(message);
    }

    public readSync (): never {
        throw new GeneralError(RUNTIME_ERRORS.methodIsNotAvailableForAnIPCHost);
    }

    public writeSync (): never {
        throw new GeneralError(RUNTIME_ERRORS.methodIsNotAvailableForAnIPCHost);
    }
}


export class ServiceTransport extends EventEmitter implements IPCTransport {
    private readonly asyncReader: AsyncReader;
    private readonly asyncWriter: AsyncWriter;
    private readonly syncReader: SyncReader;
    private readonly syncWriter: SyncWriter;

    public constructor (inputStream: NodeJS.ReadableStream, outputStream: NodeJS.WritableStream, syncFd: number) {
        super();

        this.asyncReader = new AsyncReader(inputStream);
        this.asyncWriter = new AsyncWriter(outputStream);

        this.syncReader = new SyncReader(syncFd);
        this.syncWriter = new SyncWriter(syncFd);
    }

    public read (): void {
        this.asyncReader.on('data', data => this.emit('data', data));
        this.asyncReader.read();
    }

    public async write (message: IPCPacket): Promise<void> {
        await this.asyncWriter.write(message);
    }

    public readSync (): IPCResponsePacket {
        const message = this.syncReader.readSync();

        if (!isIPCResponsePacket(message))
            throw new GeneralError(RUNTIME_ERRORS.malformedIPCMessage);

        return message;
    }

    public writeSync (message: IPCPacket): void {
        this.syncWriter.writeSync(message);
    }
}
